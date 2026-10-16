import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, authenticateUser, createUser, setSession, getSession, clearSession, findUserByUsername } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  register: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => ({ success: false }),
  register: () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const sessionId = getSession();
    if (sessionId) {
      const found = findUserByUsername(sessionId);
      if (found) {
        setUser(found);
      } else {
        clearSession();
      }
    }
  }, []);

  const login = useCallback((username: string, password: string) => {
    const found = authenticateUser(username, password);
    if (found) {
      setUser(found);
      setSession(found.username);
      return { success: true };
    }
    return { success: false, error: 'Неверное имя пользователя или пароль' };
  }, []);

  const register = useCallback((username: string, password: string) => {
    if (username.length < 3) {
      return { success: false, error: 'Имя пользователя должно быть не менее 3 символов' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Пароль должен быть не менее 4 символов' };
    }
    const created = createUser(username, password);
    if (created) {
      setUser(created);
      setSession(created.username);
      return { success: true };
    }
    return { success: false, error: 'Пользователь с таким именем уже существует' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
