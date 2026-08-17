import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "./auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("leafly_token"));
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem("leafly_admin_token"));
  const [, setLocation] = useLocation();

  const login = useCallback((newToken: string) => {
    localStorage.setItem("leafly_token", newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("leafly_token");
    setToken(null);
    setLocation("/login");
  }, [setLocation]);

  const adminLogin = useCallback((newToken: string) => {
    localStorage.setItem("leafly_admin_token", newToken);
    setAdminToken(newToken);
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem("leafly_admin_token");
    setAdminToken(null);
    setLocation("/admin/login");
  }, [setLocation]);

  return (
    <AuthContext.Provider value={{ token, adminToken, login, logout, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
