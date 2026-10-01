"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  authenticateWithGoogle,
  authTokenKey,
  getCurrentUser,
  type AuthUser,
} from "@/lib/api/auth";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signInWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = window.localStorage.getItem(authTokenKey);

      if (!token) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        if (active) {
          setUser(currentUser);
          setToken(token);
        }
      } catch {
        window.localStorage.removeItem(authTokenKey);
        if (active) {
          setToken(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const signInWithGoogle = useCallback(async (credential: string) => {
    const authentication = await authenticateWithGoogle(credential);
    window.localStorage.setItem(authTokenKey, authentication.token);
    setToken(authentication.token);
    setUser(authentication.user);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(authTokenKey);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, signInWithGoogle, logout }),
    [user, token, loading, signInWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
