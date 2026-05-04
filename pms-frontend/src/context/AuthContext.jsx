import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginApi, logoutApi } from '../api/authApi';

const AuthContext = createContext(null);

const STORAGE_KEY = 'pms.auth';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // restore session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.user) setCurrentUser(parsed.user);
      if (parsed?.token) setToken(parsed.token);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // persist session
  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: currentUser,
        token,
      })
    );
  }, [currentUser, token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginApi({ email, password });

      if (!res.ok) {
        return { ok: false, error: res.error || 'Sign in failed' };
      }

      const nextUser = res.data?.user || null;
      const nextToken = res.data?.token || null;

      setCurrentUser(nextUser);
      setToken(nextToken);

      return { ok: true, user: nextUser };
    } catch (err) {
      return { ok: false, error: err?.message || 'Sign in failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore mock/network logout errors for now
    } finally {
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      token,
      loading,
      isAuthenticated: !!currentUser,
      login,
      logout,
      setCurrentUser, // optional, handy during migration
    }),
    [currentUser, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}