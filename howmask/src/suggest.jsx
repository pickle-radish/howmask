import React, { useRef, useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";

const url = "localhost";

// 판매처 조회화면 돌아가기 (confirm)
function RouterStore() {
  const confirm = window.confirm("이전 화면으로 이동하시겠습니까?");
  if (confirm) {
    window.location.href = "/";
  }
}

// 판매처 정보수정 제안 Form
function Suggest(props) {
  const [suggesttypestate, setSuggesttypestate] = useState({ value: "폐업" });
  const Text = useRef();

  const param = props.location.state;

  const changeSuggesttype = (e) => {
    setSuggesttypestate({ value: e });
  };

  async function registerSuggestion() {
    if (!Text.current.value) {
      alert("제안 내용을 입력해주세요");
      Text.current.focus();
      return;
    }
    let sendParam;
    if (props.location.state === undefined) {
      alert("다시 들어와주세요");
      window.location.href = "/";
    } else {
      sendParam = {
        code: param.code,
        suggestType: suggesttypestate.value,
        Text: Text.current.value,
      };
    }
    const result = await axios.post(process.env.REACT_APP_URL+`store/suggest`, sendParam);
    if (result.data.message) {
      alert("입력 완료");
      window.location.href = "/";
      Text.current.value = "";
    } else {
      window.location.href = "/#/error";
    }
  }

  const suggestTitle = {
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
  const suggestForm = {
    display: "inline-block",
    width: "50%",
    position: "fixed",
    top: 150,
    right: 0,
    bottom: 0,
    left: 100,
    margin: "auto",
  };
  return (
    <>
      <h2 style={suggestTitle}>판매처 정보수정 제안</h2>
      <Form style={suggestForm}>
        <Col sm={10}>
          <Form.Label>수정 제안할 항목을 선택하세요.</Form.Label>
          <Form.Control
            as="select"
            value={suggesttypestate.value}
            onChange={(e) => changeSuggesttype(e.target.value)}
          >
            <option value="폐업">폐업</option>
            <option value="판매처명">판매처명</option>
            <option value="주소 및 위치">주소 및 위치</option>
            <option value="전화번호">전화번호</option>
            <option value="진료 및 영업시간">진료 및 영업시간</option>
            <option value="마스크 종류 및 재고">마스크 종류 및 재고</option>
            <option value="기타">기타(약국 등 판매처 정보에 대한 제보만 가능)</option>
          </Form.Control>
          <br />
          <Form.Label>제안 상세 내용</Form.Label>
          <Form.Text className="text-muted">반드시 입력해주세요.</Form.Text>
          <Form.Control
            as="textarea"
            rows="3"
            ref={Text}
            placeholder="(예시) 진료시간이 오후 5시까지인데 6시까지로 되어 있습니다."
            maxLength="200"
          />
          <br />
          <Row>
            <Col>
              <Button
                onClick={() => {
                  RouterStore(true);
                }}
                variant="warning"
                size="lg"
                block
              >
                돌아가기
              </Button>
            </Col>
            <Col>
              <Button variant="info" size="lg" block onClick={registerSuggestion}>
                등록하기
              </Button>
            </Col>
          </Row>
        </Col>
      </Form>
    </>
  );
}

export default Suggest;
