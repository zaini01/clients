import React, { useState, useEffect } from "react";
import queryString from "query-string";

function App() {
  const [code, setCode] = useState("");
  const [user, setUser] = useState({});
  const [token, setToken] = useState({});
  const [loading, setLoading] = useState(false);

  const client_id = "RSK";
  const host = "http://localhost:8000";

  useEffect(() => {
    setUser({});
    setCode(queryString.parse(window.location.search).code);
    if (code) {
      exchangeCode(code);
    }
  }, [code]);

  const logIn = async (e) => {
    e.preventDefault();
    let redirect_url = window.location.href;

    if (redirect_url.includes("?code=")) {
      let arr = redirect_url.split("?code=");
      redirect_url = arr[0];
    }
    console.log(redirect_url);

    let url = `${host}/?client_id=${client_id}&redirect_url=${redirect_url}`;

    window.location.href = url;
  };

  const logout = async (e) => {
    e.preventDefault();

    let body = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      client_id: client_id,
    };

    fetch(`${host}/signOut`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
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
        setToken(token);
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
        <div>
          <div className="d-flex justify-content-center pt-5">
            <h1>WELCOME {user.data.name.toString().toUpperCase()}</h1>
          </div>
          <div className="d-flex justify-content-center pt-5">
            <button
              type="submit"
              className="btn-lg btn-primary"
              onClick={logout}
            >
              logout
            </button>
          </div>
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
