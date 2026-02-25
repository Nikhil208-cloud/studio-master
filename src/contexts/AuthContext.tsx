"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import * as db from '@/lib/db';
import type { UserData } from '@/lib/db';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, pass: string) => User;
  signup: (email: string, pass: string) => void;
  logout: () => void;
  updateUserData: (data: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const sessionUserJson = sessionStorage.getItem('health-user');
    if (sessionUserJson) {
      const sessionUser = JSON.parse(sessionUserJson);
      setUser(sessionUser);
      setUserData(db.getUserData(sessionUser.email));
    }
    setLoading(false);
  }, []);

  const login = (email: string, pass: string) => {
    const loggedInUser = db.logIn(email, pass);
    setUser(loggedInUser);
    setUserData(db.getUserData(loggedInUser.email));
    sessionStorage.setItem('health-user', JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const signup = (email: string, pass: string) => {
    db.signUp(email, pass);
  };

  const logout = () => {
    setUser(null);
    setUserData(null);
    sessionStorage.removeItem('health-user');
    router.push('/login');
  };

  const updateUserData = (data: Partial<UserData>) => {
    if (user) {
      db.saveUserData(user.email, data);
      const newUserData = db.getUserData(user.email);
      setUserData(newUserData);
    }
  };

  const value = { user, userData, loading, login, signup, logout, updateUserData };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
