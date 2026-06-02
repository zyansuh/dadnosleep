import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser } from '../types/auth';
import { apiLogin, apiMe, apiRegister, getStoredToken, setStoredToken } from '../utils/auth/authApi';

interface AuthContextValue {
  user:           AuthUser | null;
  loading:        boolean;
  isLoggedIn:     boolean;
  isAdmin:        boolean;
  login:          (email: string, password: string) => Promise<void>;
  register:       (email: string, password: string) => Promise<void>;
  logout:         () => void;
  openAuthModal:  () => void;
  closeAuthModal: () => void;
  authModalOpen:  boolean;
  authModalTab:   'login' | 'register';
  setAuthModalTab:(tab: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,           setUser]           = useState<AuthUser | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [authModalOpen,  setAuthModalOpen]  = useState(false);
  const [authModalTab,   setAuthModalTab]   = useState<'login' | 'register'>('login');

  const refresh = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { user: me } = await apiMe();
      setUser(me);
    } catch {
      setStoredToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, token } = await apiLogin(email, password);
    setStoredToken(token);
    setUser(u);
    setAuthModalOpen(false);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { user: u, token } = await apiRegister(email, password);
    setStoredToken(token);
    setUser(u);
    setAuthModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isLoggedIn:     !!user,
    isAdmin:        user?.role === 'admin',
    login,
    register,
    logout,
    openAuthModal:  () => setAuthModalOpen(true),
    closeAuthModal: () => setAuthModalOpen(false),
    authModalOpen,
    authModalTab,
    setAuthModalTab,
  }), [user, loading, login, register, logout, authModalOpen, authModalTab]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
