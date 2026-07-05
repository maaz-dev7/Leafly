import { useState } from "react";
import { useLocation } from "wouter";

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("leafly_token"));
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("leafly_admin_token"));
  const [, setLocation] = useLocation();

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
