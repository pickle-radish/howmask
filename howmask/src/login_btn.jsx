import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "react-bootstrap";
import axios from "axios";

axios.defaults.withCredentials = true;
const url = "localhost";
const headers = { withCredentials: true };

const LoginBtn = () => {
  const [isError, setIsError] = useState(false);
  const navLinkStyle = {
    margin: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 3,
    paddingBottom: 3,
    color: "#007bff",
  };

  const loginout = {
    borderBottom: 10,
  };

  const memberLogout = () => {
    axios
      .get(process.env.REACT_APP_URL+`user/logout`, { headers })
      .then((returnData) => {
        if (returnData.data.message) {
          alert(returnData.data.message);
          sessionStorage.clear();
          window.location.href = "/";
        }
      })
      .catch((err) => {
        alert("로그아웃 에러");
      });
  };

  let btn;

  if (!sessionStorage.getItem("login")) {
    btn = (
      <NavLink style={navLinkStyle} to="/login">
        <Button variant="light">
          <span style={loginout}>login</span> <i className="fas fa-sign-in-alt" id="iconStyle"></i>
        </Button>
      </NavLink>
    );
  } else if (sessionStorage.getItem("login") === "hamletshu") {
    btn = (
      <>
        <NavLink style={navLinkStyle} to="/admin">
          회원관리
        </NavLink>
        <Button style={navLinkStyle} onClick={memberLogout} variant="light">
          <span style={loginout}>logout</span>
          <i className="fas fa-sign-out-alt" id="iconStyle"></i>
        </Button>
      </>
    );
  } else {
    btn = (
      <>
        <Button style={navLinkStyle} onClick={memberLogout} variant="light">
          <span style={loginout}>log out</span>
          <i className="fas fa-sign-out-alt" id="iconStyle"></i>
        </Button>
      </>
    );
  }

  return <span>{isError ? <div>Something went wrong!</div> : <>{btn}</>}</span>;
};

export default LoginBtn;
