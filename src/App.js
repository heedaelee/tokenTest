// App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { isAuthenticatedState } from "./atom.js";
import LoginPage from "./LoginPage.js";
import HomePage from "./Homepage.js";

const App = () => {
  const isAuthenticated = useRecoilValue(isAuthenticatedState);

  console.log("isAuthenticated:", isAuthenticated);
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default App;
