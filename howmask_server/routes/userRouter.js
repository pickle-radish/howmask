const express = require("express");
const router = express.Router();
const User = require("../schemas/user");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");

const createAccountLimiter = rateLimit({
  status: 429,
  windowMs: 30 * 30 * 1000, // 15 min window
  max: 1, // start blocking after 5 requests
  message: "해당 IP로 너무 많은 계정이 생성되었습니다.\n15분 뒤 다시 만들어주세요.",
});

//관리자 회원 리스트 보기

router.get("/adminViewList", async (req, res) => {
  try {
    let user_type = req.session.user_type;

    console.log(user_type);
    if (user_type !== "7791") {
      res.json({ message: "관리자가 아닙니다." });
    } else {
      // const result = await User.find({ $or:[{user_type: "개인"},{user_type:"관리자"}] }, async (err, user) => {}
      const result = await User.find()
        .or([{ user_type: "0" }, { user_type: "1" }])
        .select("-_id user_type email nickname lockYn auth code");
      res.json({ message: "관리자 확인", result });
      console.log(result);
    }
  } catch (err) {
    console.log(err);
    res.json({ message: "로그인 실패" });
  }
});
//관리자 회원 삭제
router.post("/admindelete", async (req, res) => {
  try {
    let user_type = req.session.user_type;

    console.log(user_type);
    if (user_type !== "7791" || !req.session.email) {
      res.json({ resultCode: "0" });
    } else {
      await User.remove({
        email: req.body.email,
      });
      res.json({ resultCode: "1" });
    }
  } catch (err) {
    console.log(err);
    res.json({ resultCode: "2" });
  }
});

//관리자 판매처 계정 승인
router.post("/grantAuth", async (req, res) => {
  try {
    let user_type = req.session.user_type;

    console.log(user_type);
    if (user_type !== "7791" || !req.session.email) {
      res.json({ resultCode: "0" });
    } else {
      await User.update(
        { email: req.body.email },
        {
          $set: {
            auth: true,
          },
        }
      );
      res.json({ resultCode: "1" });
    }
  } catch (err) {
    console.log(err);
    res.json({ resultCode: "2" });
  }
});

//회원가입
router.post("/join", createAccountLimiter, async (req, res) => {
  try {
    let obj = { email: req.body.email };

    let user = await User.findOne(obj);
    console.log(user);

    if (user) {
      res.json({
        message: "이메일이 중복되었습니다. 새로운 이메일을 입력해주세요.",
        dupYn: "1",
      });
    } else {
      crypto.randomBytes(64, (err, buf) => {
        if (err) {
          console.log(err);
        } else {
          crypto.pbkdf2(
            req.body.password,
            buf.toString("base64"),
            100000,
            64,
            "sha512",
            async (err, key) => {
              if (err) {
                console.log(err);
              } else {
                console.log(key.toString("base64"));
                buf.toString("base64");
                let code = 0;
                code = req.body.code;
                obj = {
                  email: req.body.email,
                  nickname: req.body.nick,
                  user_type: req.body.usertype,
                  year: req.body.year,
                  password: key.toString("base64"),
                  salt: buf.toString("base64"),
                  code,
                };
                user = new User(obj);
                await user.save();
                res.json({ message: "회원가입 되었습니다!", dupYn: "0" });
              }
            }
          );
        }
      });
    }
  } catch (err) {
    res.json({ message: false });
  }
});

//로그인
router.post("/login", async (req, res) => {
  try {
    //이메일 값으로 아이디가 존재하는지 확인
    await User.findOne({ email: req.body.email }, async (err, user) => {
      if (err) {
        console.log(err);
      } else {
        console.log(user);
        if (user) {
          //아이디가 존재할 경우 이메일과 패스워드가 일치하는 회원이 있는지 확인
          console.log(req.body.password);
          console.log(user.salt);
          crypto.pbkdf2(req.body.password, user.salt, 100000, 64, "sha512", async (err, key) => {
            if (err) {
              console.log(err);
            } else {
              // console.log(key.toString('base64')); // 'dWhPkH6c4X1Y71A/DrAHhML3DyKQdEkUOIaSmYCI7xZkD5bLZhPF0dOSs2YZA/Y4B8XNfWd3DHIqR5234RtHzw=='

              const obj = {
                email: req.body.email,
                password: key.toString("base64"),
              };

              const user2 = await User.findOne(obj);
              console.log(user2);
              if (user2) {
                // 있으면 로그인 처리
                // console.log(req.body._id);
                await User.updateOne(
                  {
                    email: req.body.email,
                  },
                  { $set: { loginCnt: 0 } }
                );
                req.session.email = user.email;
                req.session.user_type = user2.user_type;
                if (user2.user_type == "7791") {
                  res.json({
                    message: "관리자님 로그인 되었습니다!",
                    _id: user2._id,
                    email: user2.email,
                    dupYn: "2",
                  });
                } else {
                  res.json({
                    message: "로그인 되었습니다!",
                    _id: user2._id,
                    email: user2.email,
                    type: user2.user_type,
                    dupYn: "0",
                  });
                }
              } else {
                //없으면 로그인 실패횟수 추가
                if (user.loginCnt > 4) {
                  res.json({
                    message:
                      "아이디나 패스워드가 5회 이상 일치하지 않아 잠겼습니다.\n고객센터에 문의 바랍니다.",
                  });
                } else {
                  await User.updateOne(
                    {
                      email: req.body.email,
                    },
                    { $set: { loginCnt: user.loginCnt + 1 } }
                  );
                  if (user.loginCnt >= 5) {
                    await User.updateOne(
                      {
                        email: req.body.email,
                      },
                      { $set: { lockYn: true } }
                    );
                    res.json({
                      message:
                        "아이디나 패스워드가 5회 이상 일치하지 않아 잠겼습니다.\n고객센터에 문의 바랍니다.",
                    });
                  } else {
                    res.json({
                      message: "아이디나 패스워드가 일치하지 않습니다.",
                    });
                  }
                }
              }
            }
          });
        } else {
          res.json({ message: "아이디나 패스워드가 일치하지 않습니다." });
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ message: "로그인 실패" });
  }
});

router.get("/logout", (req, res) => {
  console.log("/logout" + req.sessionID);
  req.session.destroy(() => {
    res.json({ message: "logout 되었습니다." });
  });
});

router.post("/delete", async (req, res) => {
  try {
    await User.remove({
      _id: req.body._id,
    });
    res.json({ message: true });
  } catch (err) {
    console.log(err);
    res.json({ message: false });
  }
});

// 회원 현재 비밀번호 확인 
router.post("/modify/Checkpw", async (req, res) => {
  try {
    
    crypto.pbkdf2(
      req.body.password,
      buf.toString("base64"),
      100000,
      64,
      "sha512",
      async (err, key) => {
        if (err) {
          console.log(err);
        } else {
          console.log(key.toString("base64"));
          buf.toString("base64");
          const obj = {
            email: req.session.email,
            password: key.toString("base64"),
            salt: buf.toString("base64")
          };
        }
      }
    );

    let user = await User.findOne(obj);
         
    if (user) {
      res.json({
        message: true,
        dupYn: "0"
      });
    } else {
      res.json({
        message: "비밀번호가 일치하지 않습니다. 다시 입력해 주세요",
        dupYn: "1"
    });
   }
  } catch(err) {
    console.log(err);
    res.json({message: false })
  }
});



// 회원정보 수정
router.post("/update", async (req, res) => {
  try {
    let obj = {
      password: req.body.password,
      nick: req.body.nick,
      year: req.body.year
    };
    console.log(obj);
    const returnData = await User.update({email: req.body.email}, obj);
    console.log(returnData)
    res.json({ message: "회원님의 정보가 수정이 완료되었습니다." });
  } catch (err) {
    console.log(err);
    res.json({ message: false });
  }
});


router.post("/getUserInfo", async (req, res) => {
  try {
    const userInfo = await User.findOne({ email: req.session.email });
    res.json({ userInfo, email: req.session.email });
  } catch (err) {
    console.log(err);
    res.json({ info: false });
  }
});

router.post("/add", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: true });
  } catch (err) {
    console.log(err);
    res.json({ message: false });
  }
});

router.post("/getAllMember", async (req, res) => {
  try {
    const user = await User.find({});
    res.json({ message: user });
  } catch (err) {
    console.log(err);
    res.json({ message: false });
  }
});

module.exports = router;
