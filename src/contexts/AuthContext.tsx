import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { getAccessToken, getStoredUser, clearTokens, setStoredUser } from '@/services/api';
import { User, AppUser } from '@/types/lms';

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    country?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isInstructor: boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUserToAppUser(user: User): AppUser {
  return {
    id: user.id,
    username: user.username || user.email.split('@')[0],
    email: user.email,
    name: `${user.first_name} ${user.last_name}`.trim(),
    role: user.role,
    profilePicture: user.profile_picture_url,
    country: user.country,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = () => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(mapUserToAppUser(storedUser));
    } else {
      setUser(null);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const token = getAccessToken();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      setUser(mapUserToAppUser(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.login(email, password);
      setUser(mapUserToAppUser(response.user));
      return { success: true };
    } catch (error) {
      console.error('Login failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  };

  const signup = async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    country?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.register(data);
      setUser(mapUserToAppUser(response.user));
      return { success: true };
    } catch (error) {
      console.error('Signup failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      isAdmin: user?.role === 'admin',
      isInstructor: user?.role === 'instructor' || user?.role === 'admin',
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
