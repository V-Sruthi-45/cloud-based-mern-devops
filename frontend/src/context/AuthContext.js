// =============================================================
// context/AuthContext.js - Global Authentication State
// Provides user state and auth actions to the entire app
// =============================================================

import React, { createContext, useContext, useReducer, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_LOADING":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "PROFILE_UPDATED":
      return { ...state, user: action.payload, isLoading: false };
    case "LOGOUT":
      return { ...initialState, token: null, isLoading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "LOADING_DONE":
      return { ...state, isLoading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount, validate existing token
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch({ type: "LOADING_DONE" });
        return;
      }
      try {
        const res = await api.get("/auth/profile");
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: res.data.user, token },
        });
      } catch {
        localStorage.removeItem("token");
        dispatch({ type: "LOGOUT" });
      }
    };
    verifyToken();
  }, []);

  const register = async (name, email, password) => {
    dispatch({ type: "AUTH_LOADING" });
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", res.data.token);
    dispatch({ type: "AUTH_SUCCESS", payload: res.data });
    return res.data;
  };

  const login = async (email, password) => {
    dispatch({ type: "AUTH_LOADING" });
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    dispatch({ type: "AUTH_SUCCESS", payload: res.data });
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  const updateProfile = async (data) => {
    const res = await api.put("/auth/profile", data);
    dispatch({ type: "PROFILE_UPDATED", payload: res.data.user });
    return res.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  };

  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
