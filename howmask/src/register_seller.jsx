import React, { useState, useRef, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import axios from "axios";

const url = "localhost";

// 판매처 조회화면 돌아가기
function RouterStore() {
  const confirm = window.confirm("이전 화면으로 이동하시겠습니까?");
  if (confirm) {
    window.location.href = "/";
  }
}

// 판매처 계정 등록 Form
function RegisterSeller(props) {
  // 판매처 계정 등록 Event
  const [emailinvalid, setEmailinvalid] = useState(false);
  const [emailvalid, setEmailvalid] = useState(false);
  const [param, setParam] = useState();

  const inputStoreName = useRef();
  const inputStoreAddress = useRef();
  const inputStoreBizCode = useRef();
  const inputSellerName = useRef();
  const inputPhoneNumber = useRef();
  const inputSellerEmail = useRef();

  // Modal로부터 값 받아오기
  function setStoreInfo() {
    const param = props.location.state;

    //파라미터 저장(input 이외에 추가로 이전페이지에서 넘겨줘야 되는 값들을 사용하기 위해 세팅)
    setParam(param);
    //textfield 값 세팅
    inputStoreName.current.defaultValue = param.name;
    inputStoreAddress.current.defaultValue = param.addr;
  }

  useEffect(() => {
    //locaiton state값이 비어있지 않을 경우
    if (props.location.state !== undefined) {
      setStoreInfo();
    }
  });

  // 이메일 형식 체크
  const validateEmail = (emailEntered) => {
    const emailRegExp = /^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/;
    if (emailEntered.match(emailRegExp)) {
      setEmailinvalid(false);
      setEmailvalid(true);
    } else {
      setEmailinvalid(true);
      setEmailvalid(false);
    }
  };
  async function Register() {
    const regExp = /^[ㄱ-ㅎ가-힣0-9a-zA-Z]*$/;
    const phoneRegExp = /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})?$/;
    const regNumber = /^[0-9]*$/;

    const storeName = inputStoreName.current.value;
    const address = inputStoreAddress.current.value;
    const bizCode = inputStoreBizCode.current.value;
    const sellerName = inputSellerName.current.value;
    const phone = inputPhoneNumber.current.value;
    const email = inputSellerEmail.current.value;

    // alert(storeName + address);

    // const type = param.type;
    // const code = param.code;
    if (!storeName) {
      alert("판매처명을 입력하세요");
      inputStoreName.current.focus();
      return;
    } else if (!address) {
      alert("판매처 주소를 입력하세요");
      inputStoreAddress.current.focus();
      return;
    } else if (!bizCode) {
      alert("사업자등록번호를 입력하세요");
      inputStoreBizCode.current.focus();
      return;
    } else if (!sellerName) {
      alert("관리자 이름을 입력하세요");
      inputSellerName.current.focus();
      return;
    } else if (!phone) {
      alert("관리자 휴대전화번호를 입력하세요");
      inputPhoneNumber.current.focus();
      return;
    } else if (!email) {
      alert("관리자 이메일을 입력하세요");
      inputSellerEmail.current.focus();
      return;
    }

    if (!bizCode.match(regNumber)) {
      alert("사업자등록번호가 양식에 맞지 않습니다.");
      return;
    } else if (!sellerName.match(regExp)) {
      alert("판매자명이 양식에 맞지 않습니다.");
      return;
    } else if (!phone.match(phoneRegExp)) {
      alert("전화번호가 양식에 맞지 않습니다.");
      return;
    }

    if (!emailvalid) {
      alert("이메일 형식이 맞지 않습니다. 다시 입력해주세요.");
      inputSellerEmail.current.focus();
      return;
    }

    const sendParamStore = {
      code: param.code,
      bizCode,
      storeType: param.type,
      storeName,
      address,
      sellerName,
      phone,
      // type,
      // code
    };
    const sendParamUser = {
      code: param.code,
      email,
      nick: "seller",
      usertype: 1,
      password: "a123456789*",
      year: 0,
    };

    // alert();

    const resultStore = await axios.post(process.env.REACT_APP_URL+`store/join`, sendParamStore);
    const resultUser = await axios.post(process.env.REACT_APP_URL+`user/join`, sendParamUser);
    if (resultStore.data.message && resultUser.data.dupYn === "0") {
      alert("판매처 계정이 신청되었습니다.\n관리자 승인 후 입력하신 메일로 안내문을 전달드립니다.");
      window.location.href = "/";
    } else if (!resultStore.data.message) {
      alert("Store 테이블 오류");
    } else if (resultUser.data.dupYn === "1") {
      await axios.post(process.env.REACT_APP_URL+`store/joinfail`, sendParamStore);
      alert("중복된 이메일입니다.");
    } else if (resultUser.data.message) {
      alert("입력 오류");
    } else {
      alert("입력 오류");
    }
  }
  const registerTitle = {
    display: "inline-block",
    width: "50%",
    position: "fixed",
    top: 90,
    right: 0,
    bottom: 0,
    left: 0,
    margin: "auto",
    textAlign: "center",
  };
  const registerForm = {
    display: "inline-block",
    width: "50%",
    position: "fixed",
    top: 150,
    right: 0,
    bottom: 0,
    left: 0,
    margin: "auto",
  };
  return (
    <>
      <h2 style={registerTitle}>판매처 계정 신청</h2>
      <Form style={registerForm}>
        <Form.Label>판매처 정보</Form.Label>
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label>
              <font color="#246dbf">판매처명</font>
            </Form.Label>
            <Form.Control ref={inputStoreName} placeholder="판매처명" readOnly="true" />
          </Form.Group>
          <Form.Group as={Col} controlId="storeCode">
            <Form.Label>
              <font color="#246dbf">사업자등록번호</font>
            </Form.Label>
            <Form.Control ref={inputStoreBizCode} placeholder="사업자등록번호*" maxLength="12" />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId="storeLocation">
            <Form.Label>
              <font color="#246dbf">주소</font>
            </Form.Label>
            <Form.Control ref={inputStoreAddress} placeholder="판매처 주소" readOnly="true" />
          </Form.Group>
        </Form.Row>

        <br />
        <Form.Label>관리자 정보</Form.Label>

        <Form.Row>
          <Form.Group as={Col} controlId="formGridCity">
            <Form.Label>
              <font color="#246dbf">이름</font>
            </Form.Label>
            <Form.Control ref={inputSellerName} placeholder="이름*" maxLength="24" />
          </Form.Group>

          <Form.Group as={Col} controlId="formGridState">
            <Form.Label>
              <font color="#246dbf">휴대전화번호</font>
            </Form.Label>
            <Form.Control ref={inputPhoneNumber} placeholder="휴대전화번호*" maxLength="13" />
          </Form.Group>

          <Form.Group as={Col} controlId="formGridZip">
            <Form.Label>
              <font color="#246dbf">이메일</font>
            </Form.Label>

            <Form.Control
              ref={inputSellerEmail}
              isInvalid={emailinvalid}
              isValid={emailvalid}
              onChange={(e) => validateEmail(e.target.value)}
              placeholder="이메일*"
              maxLength="36"
            />
            <Form.Text className="text-muted">
              입력하신 이메일로 계정정보 안내를 해드립니다.
            </Form.Text>
          </Form.Group>
        </Form.Row>
        <Row>
          <Col>
            <Button
              as={Col}
              variant="warning"
              onClick={() => {
                RouterStore(true);
              }}
            >
              돌아가기
            </Button>
          </Col>
          <Col>
            <Button
              variant="info"
              as={Col}
              onClick={() => {
                Register();
              }}
            >
              신청하기
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default RegisterSeller;
