import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { mockAuthService } from '@/services/mockAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = mockAuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await mockAuthService.login(email, password);
    setUser(loggedInUser);
  };

  const register = async (email: string, password: string, name: string) => {
    const newUser = await mockAuthService.register(email, password, name);
    setUser(newUser);
  };

  const logout = () => {
    mockAuthService.logout();
    setUser(null);
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = mockAuthService.updateUser(user.id, updates);
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
