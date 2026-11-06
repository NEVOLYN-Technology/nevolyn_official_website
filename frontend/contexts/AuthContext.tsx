"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { LoginResponse } from "@/types";

/**
 * Interface contract defining authentication context state and dispatch operations.
 */
export interface AuthContextType {
  /** Authenticated user profile or null if unauthenticated. */
  user: LoginResponse | null;
  /** Boolean flag indicating if a valid user session exists. */
  isAuthenticated: boolean;
  /** True if the current user has ADMIN or SUPER_ADMIN privileges. */
  isAdmin: boolean;
  /** True only if the current user is a SUPER_ADMIN (highest privilege tier). */
  isSuperAdmin: boolean;
  /** Boolean flag indicating if the initial session bootstrap check is pending. */
  isLoading: boolean;
  /** Authenticates user with username/password credentials. */
  login: (identifier: string, password: string) => Promise<LoginResponse>;
  /** Invalidates current user session and redirects to login. */
  logout: () => Promise<void>;
  /** Re-queries the /auth/me profile endpoint to refresh current user state. */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Context Provider component managing global session state,
 * profile bootstrapping via secure cookies, and route redirection.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authApi.me();
      if (res.data?.data) {
        setUser(res.data.data);
        if (typeof window !== "undefined") {
          const isHttps = window.location.protocol === "https:";
          document.cookie = `nevolyn_session=1; path=/; max-age=86400; SameSite=Lax${isHttps ? "; Secure" : ""}`;
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr?.response?.status === 401) {
        if (typeof window !== "undefined") {
          document.cookie = "nevolyn_session=; path=/; max-age=0; SameSite=Lax";
          document.cookie = "nevolyn_access_token=; path=/; max-age=0; SameSite=Lax";
          localStorage.removeItem("nevolyn_token");
        }
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      // If we are on /login (or /office/login) and have no stored session indicators, avoid a failing /me call
      if (typeof window !== "undefined") {
        const hasSessionCookie = document.cookie.includes("nevolyn_session=");
        const hasStoredToken = !!localStorage.getItem("nevolyn_token");
        if (!hasSessionCookie && !hasStoredToken && window.location.pathname.endsWith("/login")) {
          if (isMounted) setIsLoading(false);
          return;
        }
      }

      try {
        const res = await authApi.me();
        if (isMounted && res.data?.data) {
          setUser(res.data.data);
          if (typeof window !== "undefined") {
            const isHttps = window.location.protocol === "https:";
            document.cookie = `nevolyn_session=1; path=/; max-age=86400; SameSite=Lax${isHttps ? "; Secure" : ""}`;
            // Clean up any old fake cookie if it lingered from previous versions
            document.cookie = "nevolyn_access_token=; path=/; max-age=0; SameSite=Lax";
          }
        }
      } catch (err: unknown) {
        if (isMounted) setUser(null);
        const axiosErr = err as { response?: { status?: number } };
        if (typeof window !== "undefined" && axiosErr?.response?.status === 401) {
          document.cookie = "nevolyn_session=; path=/; max-age=0; SameSite=Lax";
          document.cookie = "nevolyn_access_token=; path=/; max-age=0; SameSite=Lax";
          localStorage.removeItem("nevolyn_token");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identifier: string, password: string): Promise<LoginResponse> => {
    const res = await authApi.login(identifier, password);
    const userData = res.data.data!;
    setUser(userData);
    let targetRoute = "/office/dashboard";
    if (typeof window !== "undefined") {
      if (userData.token) {
        localStorage.setItem("nevolyn_token", userData.token);
      }
      const isHttps = window.location.protocol === "https:";
      document.cookie = `nevolyn_session=1; path=/; max-age=86400; SameSite=Lax${isHttps ? "; Secure" : ""}`;
      // Remove any legacy fake cookie so it never conflicts with the backend's HttpOnly cookie
      document.cookie = "nevolyn_access_token=; path=/; max-age=0; SameSite=Lax";

      const fromParam = new URLSearchParams(window.location.search).get("from");
      if (fromParam && fromParam.startsWith("/")) {
        const cleanFrom = fromParam.replace(/^\/office/, "") || "/dashboard";
        if (!cleanFrom.startsWith("/login")) {
          targetRoute = `/office${cleanFrom}`;
        }
      }
    }
    router.push(targetRoute);
    return userData;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignored if offline or already invalidated
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("nevolyn_token");
        document.cookie = "nevolyn_session=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "nevolyn_access_token=; path=/; max-age=0; SameSite=Lax";
      }
      setUser(null);
      router.push("/office/login");
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isSuperAdmin,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
