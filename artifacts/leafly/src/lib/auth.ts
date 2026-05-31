import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { customFetch } from "@workspace/api-client-react/src/custom-fetch";

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("leafly_token"));
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("leafly_admin_token"));
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Intercept axios/customFetch to inject token if it's set
    // We can't actually modify the generated customFetch easily here unless it looks for localStorage
    // But wait, the customFetch is generated. Let's see how it's implemented or just know it uses standard fetch.
    // Actually, we can intercept global fetch or just let customFetch read from localStorage if we override it.
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("leafly_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("leafly_token");
    setToken(null);
    setLocation("/login");
  };

  const adminLogin = (newToken: string) => {
    localStorage.setItem("leafly_admin_token", newToken);
    setAdminToken(newToken);
  };

  const adminLogout = () => {
    localStorage.removeItem("leafly_admin_token");
    setAdminToken(null);
    setLocation("/admin/login");
  };

  return { token, adminToken, login, logout, adminLogin, adminLogout };
}
