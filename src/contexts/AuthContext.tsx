import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { APIUser } from '@/services/api';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isInstructor: boolean;
  bio?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string, passwordConfirm: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'kukekodes_auth_user';

function mapAPIUserToUser(apiUser: APIUser): User {
  return {
    id: apiUser.id,
    username: apiUser.username,
    email: apiUser.email,
    name: `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.username,
    role: apiUser.is_instructor ? 'admin' : 'user',
    isInstructor: apiUser.is_instructor,
    bio: apiUser.bio,
    profilePicture: apiUser.profile_picture,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      // Try to get current user from API by checking user-progress (requires auth)
      const users = await api.getUsers();
      // For now, we rely on stored user since Django session auth
      // The user info is stored locally after successful login
    } catch (error) {
      // Not authenticated
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await api.login(username, password);

      if (result.success) {
        // Fetch user details after login
        try {
          const users = await api.getUsers();
          const foundUser = users.find(u => u.username === username);
          if (foundUser) {
            const mappedUser = mapAPIUserToUser(foundUser);
            setUser(mappedUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mappedUser));
            return { success: true };
          } else {
            // Fallback if user not in list (should not happen if auth works)
            throw new Error('User details not found');
          }
        } catch (e) {
          // If we can't get the user details, we might still be logged in but can't build the local user object fully.
          // Ideally we should have a /users/me/ endpoint or similar.
          // For now, we rely on username from login.
          console.error("Failed to fetch user details", e);
          return { success: false, error: 'Failed to retrieve user profile' };
        }
      }
      console.error("Login failed details:", result);
      if (result.status === 403) return { success: false, error: 'Access denied: CSRF or Permission issue' };
      if (result.status === 401) return { success: false, error: 'Invalid username or password' };
      return { success: false, error: `Login failed (Status: ${result.status})` };
    } catch (error) {
      console.error("Login exception", error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const signup = async (username: string, email: string, password: string, passwordConfirm: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await api.register(username, email, password, passwordConfirm);

      if (result.success) {
        // Auto-login after registration
        const loginResult = await login(username, password);
        return loginResult;
      }

      console.error("Signup failed details:", result);
      return { success: false, error: `Registration failed (Status: ${result.status})` };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      isAdmin: user?.role === 'admin' || user?.isInstructor === true,
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
