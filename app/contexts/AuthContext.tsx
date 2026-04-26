import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useClientSideMount } from '~/hooks/useClientSideMount';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: string;
  token: string;
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

const STORAGE_KEY = 'crm-auth';

function parseStoredAuth(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasMounted = useClientSideMount();

  useEffect(() => {
    if (!hasMounted) return;
    setUser(parseStoredAuth());
    setIsLoading(false);
  }, [hasMounted]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/authentications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'authentication',
            attributes: { email, password },
          },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setIsLoading(false);
        return {
          success: false,
          error: body?.errors?.[0]?.detail || body?.errors?.[0]?.title || 'Invalid email or password',
        };
      }

      const body = await res.json();
      const auth = body.data;
      const token = auth.attributes.token;

      // Fetch current actor profile using the token
      const meRes = await fetch(`${API_BASE}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.api+json',
        },
      });

      let name = email;
      let role = 'Member';
      let actorId = auth.id;

      if (meRes.ok) {
        const meBody = await meRes.json();
        const actor = meBody.data;
        const firstName = actor.attributes.first_name || '';
        const lastName = actor.attributes.last_name || '';
        name = `${firstName} ${lastName}`.trim();
        role = actor.attributes.type || 'Member';
        actorId = actor.id;
      }

      const initials = name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const userData: User = {
        id: actorId,
        email,
        name,
        initials,
        role,
        token,
      };

      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: 'Unable to connect to the server' };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    // Signup is not yet implemented on the API — fall back to login after creation
    setIsLoading(false);
    return { success: false, error: 'Signup is not yet available. Please contact an administrator.' };
  };

  const logout = async () => {
    if (user?.token) {
      try {
        await fetch(`${API_BASE}/authentications`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Accept': 'application/vnd.api+json',
          },
        });
      } catch {
        // Best-effort revocation
      }
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
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
