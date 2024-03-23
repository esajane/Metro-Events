import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import {jwtDecode }from 'jwt-decode';

interface DecodedToken {
  username: string;
  role: string;
  exp: number; 
  iat: number;
}

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  auth: {
    token: string | null;
    user?: User | null;
  };
  setAuth: (auth: { token: string | null; user?: User | null }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const getTokenUser = (token: string | null): User | null => {
    if (!token) return null;
    try {
      const decoded: DecodedToken = jwtDecode(token); // Use the DecodedToken interface
      const user: User = {
        username: decoded.username,
        role: decoded.role,
      };
      return user;
    } catch (error) {
      console.error("Token decoding failed:", error);
      return null;
    }
  };

  const [auth, setAuth] = useState<{
    token: string | null;
    user?: User | null;
  }>({
    token: localStorage.getItem('token'),
    user: getTokenUser(localStorage.getItem('token')),
  });

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
