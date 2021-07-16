import React, { useState, useEffect } from "react";
import queryString from "query-string";

function App() {
  const [code, setCode] = useState("");
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  const client_id = "RSK";
  const host = "http://10.10.2.82";
  let receiver = document.getElementById("receiver").contentWindow;

  useEffect(() => {
    setLoading(true);
    setUser({});
    setCode(queryString.parse(window.location.search).code);
    if (code) {
      exchangeCode(code);
    } else {
      //get data
      receiver.postMessage(
        JSON.stringify({ key: "storage", method: "get" }),
        "*"
      );
    }
  }, [code]);

  window.onmessage = function (e) {
    if (e.origin !== "https://zaini01.github.io") {
      return;
    }

    let access_token;

    if (e.data === "not allowed") {
      setLoading(false);
    } else if (e.data) {
      access_token = JSON.parse(e.data).access_token;
    } else {
      setLoading(false);
    }

    if (access_token) {
      fetch(`${host}/checkSSO`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ access_token: access_token }),
      })
        .then((response) => response.json())
        .then((data) => {
          setUser({ data });
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    } else {
      setLoading(false);
    }
  };

  const logIn = async (e) => {
    e.preventDefault();
    let redirect_url = window.location.href;
    let url = `${host}/?client_id=${client_id}&redirect_url=${redirect_url}`;
    window.location.href = url;
  };

  const exchangeCode = async (code) => {
    let token;
    let body = {
      code: code,
      client_id: client_id,
    };
    fetch(`${host}/exchangeCode`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        localStorage.tokenSSO = JSON.stringify(data);
        token = JSON.parse(localStorage.tokenSSO);
        let body = {
          access_token: token.access_token,
        };

        //CHECK SSO
        return fetch(`${host}/checkSSO`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(body),
        });
      })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        // save obj in subdomain localStorage
        receiver.postMessage(
          JSON.stringify({ key: "storage", method: "set", data: token }),
          "*"
        );
        setLoading(false);
        setUser({ data });
      })
      .catch((err) => {
        setLoading(false);
        if (err === "SyntaxError: Unexpected token i in JSON at position 0") {
          alert("invalid code");
        }
      });
  };

  if (user.data) {
    if (user.data.name) {
      return (
        <div className="d-flex justify-content-center pt-5">
          <h1>WELCOME {user.data.name.toString().toUpperCase()}</h1>
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5 m-5">
        <div
          className="spinner-border"
          style={{ width: 115, height: 115, color: "lightblue" }}
          role="status"
        ></div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center pt-5">
      <button type="submit" className="btn-lg btn-primary" onClick={logIn}>
        Login
      </button>
    </div>
  );
}

export default App;
