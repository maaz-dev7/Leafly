import { createContext, useContext, useState, useCallback } from "react";
import { useLocation } from "wouter";

interface AuthCtx {
  token: string | null;
  adminToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  adminLogin: (token: string) => void;
  adminLogout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
