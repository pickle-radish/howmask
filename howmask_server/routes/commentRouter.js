const express = require("express");
const router = express.Router();
const Comment = require("../schemas/comment");
const multer = require("multer");
const moment = require("moment");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/upload/"); // 파일이 저장되는 경로입니다.
  },
  filename: function (req, file, cb) {
    cb(null, new Date().valueOf() + moment().format("YYYYMMDDHHmmss") + "_" + file.originalname); // 저장되는 파일명
  },
});

const upload = multer({ storage: storage });

router.post("/delete", async (req, res) => {
  try {
    // 로그인 했을 때
    if (req.session.email) {
      fs.unlink(`./public${req.body.imageUrl}`, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("파일 삭제 성공");
        }
      });
      await Comment.remove({
        _id: req.body._id,
      });
      res.json({ session: true });
    }
    // 로그인 안했을 때
    else {
      res.json({ session: false });
    }
  } catch (err) {
    // 시스템 에러
    console.log(err);
    res.status(400).send();
    res.json({ message: false });
  }
});

router.post("/update", upload.single("img"), async (req, res) => {
  try {
    const comment = await Comment.find({ _id: req.body._id });
    // 수정 후 입력버튼 클릭 (DB에 수정된 값 저장)
    if (req.body.flag) {
      // 빈 문자열을 댓글로 입력할 경우
      if (req.body.text === "") {
        res.json({ resultCode: 3, comment: comment });
      }
      // 내용의 변경사항이 없는 경우
      else if (req.body.text === comment[0].text) {
        res.json({ resultCode: 2 });
      } else {
        await Comment.update(
          { _id: req.body._id },
          {
            $set: {
              text: req.body.text,
              grade: req.body.grade,
              updatedAt: Date.now(),
            },
          }
        );
        res.json({ resultCode: 1, comment: comment });
      }
    } else {
      // 수정버튼 클릭  (DB에서 수정할 값 조회)
      res.json({ comment: comment });
    }
  } catch (err) {
    res.json({ resultCode: 0 });
    res.status(400).send();
  }
});

router.post("/write", upload.single("img"), async (req, res) => {
  try {
    let obj;
    if (req.session.email) {
      if (req.file) {
        // 5MB 이상의 파일 크기 불허
        if (req.file.size > 5000000) {
          res.json({ fileCode: 0 });
          res.status(400).send();
        } else {
          const test = req.file.path.split("public");
          obj = {
            commenter: req.session._id,
            email: req.session.email,
            code: req.body.code,
            grade: req.body.grade,
            text: req.body.text,
            image: test[1],
          };
        }
      } else {
        obj = {
          commenter: req.session._id,
          email: req.session.email,
          code: req.body.code,
          grade: req.body.grade,
          text: req.body.text,
        };
      }
      const comment = new Comment(obj);
      console.log("1 comment inserted");
      await comment.save();
      res.json({ resultCode: 1 });
    } else {
      res.json({ resultCode: 0 });
      res.status(400).send();
    }
  } catch (err) {
    console.log(err);
    res.json({ resultCode: 2 });
  }
});

router.post("/getCommentList", async (req, res) => {
  try {
    let gradeAvg = 0;
    let gradeSum = 0;
    const comment = await Comment.find({ code: req.body.code }, null, {
      sort: { createdAt: -1 },
    }).populate("commenter");

    if (comment.length > 0) {
      for (i = 0; i < comment.length; i++) {
        gradeSum += comment[i].grade;
      }
      gradeAvg = (gradeSum / comment.length).toFixed(1);
    } else {
      gradeAvg = "평점 없음";
    }
    if (req.session.email) {
      for (i = 0; i < comment.length; i++) {
        if (req.session.email === comment[i].email) {
          comment[i].mine = true;
        } else {
          comment[i].mine = false;
        }
      }
    }
    res.json({ list: comment, avg: { gradeAvg } });
  } catch (err) {
    res.json({ message: false });
    res.status(400).send();
  }
});

router.post("/detail", async (req, res) => {
  try {
    const _id = req.body._id;
    const comment = await Comment.find({ _id });
    res.json({ comment });
  } catch (err) {
    console.log(err);
    res.json({ message: false });
  }
});

module.exports = router;
