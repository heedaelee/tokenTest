// App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import api from "./api.js";
import { jwtDecode } from "jwt-decode";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [testData, setTestData] = useState(null);

  // 새로고침 시 로그인 상태 유지
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) setIsAuthenticated(true);
  }, []);

  console.log("isAuthenticated:", isAuthenticated);

  const fetchTestData = async () => {
    console.log("fetchTestData함수 호출");
    try {
      const accessToken = localStorage.getItem("accessToken");
      // 토큰이 있을 때만 토큰 남은 시간을 출력
      if (accessToken) {
        const remainingTime = getAccessTokenRemainingTime(accessToken);
        console.log(`토큰남은 시간: ${remainingTime} seconds`);
      }

      const response = await api.get("/test-data");
      const data = response.data; // Axios 응답 데이터 접근
      setTestData(data.message);
    } catch (error) {
      console.error("Error fetching test data:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await api.post("/login", {
        username: "user1",
        password: "password1",
      });
      const { accessToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
  };

  const getAccessTokenRemainingTime = (token) => {
    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp - currentTime;
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>{`Authenticated `}</h1>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={fetchTestData}>Fetch Test Data</button>
          {testData && <p>{testData}</p>}
        </div>
      ) : (
        <div>
          <h1>Please log in</h1>
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
};

export default App;
