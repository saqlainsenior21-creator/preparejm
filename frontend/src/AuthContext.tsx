import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  parish?: string;
  role: 'citizen' | 'coordinator' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuth: boolean;
  isCoord: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pjm_token'));
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem('pjm_user');
    return u ? JSON.parse(u) : null;
  });

  const login = (t: string, u: User) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('pjm_token', t);
    localStorage.setItem('pjm_user', JSON.stringify(u));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pjm_token');
    localStorage.removeItem('pjm_user');
  };

  return (
    <AuthContext.Provider value={{
      user, token, login, logout,
      isAuth: !!user,
      isCoord: user?.role === 'coordinator' || user?.role === 'admin',
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
