import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useClientSideMount } from '~/hooks/useClientSideMount';

interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  avatar?: string;
  role: string;
  organizationId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user for demo purposes
const mockUser: User = {
  id: "1",
  email: "kobe@example.com",
  name: "Kobe Raypole",
  initials: "KR",
  role: "Admin",
  organizationId: "org1"
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasMounted = useClientSideMount();

  useEffect(() => {
    if (!hasMounted) return;
    
    // Check if user is logged in (check localStorage)
    const storedUser = localStorage.getItem('crm-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('crm-user');
      }
    }
    setIsLoading(false);
  }, [hasMounted]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in real app, this would be an API call
    if (email === "kobe@example.com" && password === "password") {
      setUser(mockUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('crm-user', JSON.stringify(mockUser));
      }
      setIsLoading(false);
      return { success: true };
    }
    
    setIsLoading(false);
    return { success: false, error: "Invalid email or password" };
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock signup - in real app, this would be an API call
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase(),
      role: "User",
      organizationId: "org1"
    };
    
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('crm-user', JSON.stringify(newUser));
    }
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crm-user');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}