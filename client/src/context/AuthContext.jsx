import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAccessToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(
    () => localStorage.getItem('accessToken') || null
  );
  const [loading, setLoading] = useState(true);

  const isPro = user?.plan === 'pro' || user?.plan === 'lifetime';

  useEffect(() => {
    async function restoreSession() {
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        setAccessTokenState(data.accessToken);
        setUser(data.user);
      } catch {
        setAccessToken(null);
        setAccessTokenState(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setAccessTokenState(data.accessToken);
    setUser(data.user);
    return data;
  };

  const register = async (email, password, displayName) => {
    const { data } = await api.post('/auth/register', {
      email,
      password,
      displayName,
    });
    setAccessToken(data.accessToken);
    setAccessTokenState(data.accessToken);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setAccessTokenState(null);
      setUser(null);
    }
  };

  const refreshToken = async () => {
    const { data } = await api.post('/auth/refresh');
    setAccessToken(data.accessToken);
    setAccessTokenState(data.accessToken);
    setUser(data.user);
    return data.accessToken;
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      login,
      register,
      logout,
      refreshToken,
      isPro,
    }),
    [user, accessToken, loading, isPro]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
