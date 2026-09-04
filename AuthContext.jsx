// src/context/AuthContext.jsx

import { createContext, useState, useEffect } from "react";
import API from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const login = (userData, accessToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    if (accessToken) {
      localStorage.setItem("token", accessToken);
      setToken(accessToken);
    }
    setUser(userData);
  };

  const logout = async () => {
    try {
      await API.post("/logout");
    } catch (err) {
      console.warn("Logout API failed", err);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

