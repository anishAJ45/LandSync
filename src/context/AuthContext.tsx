import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, AuthResponse, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, role?: string) => Promise<User>;
  register: (fullName: string, email: string, password: string, role?: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  getDefaultDashboardRoute: (role?: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('landsync_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const getDefaultDashboardRoute = (role?: UserRole): string => {
    const targetRole = role || user?.role;
    switch (targetRole) {
      case 'citizen':
        return '/citizen/dashboard';
      case 'officer':
        return '/officer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  // Restore authenticated user session on initial mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('landsync_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<User>('/api/auth/me');
        setUser(response.data);
        localStorage.setItem('landsync_user', JSON.stringify(response.data));
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('landsync_token');
        localStorage.removeItem('landsync_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string, role?: string): Promise<User> => {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
      role
    });

    const { access_token, user: loggedUser } = response.data;
    localStorage.setItem('landsync_token', access_token);
    localStorage.setItem('landsync_user', JSON.stringify(loggedUser));
    setToken(access_token);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (fullName: string, email: string, password: string, role?: string): Promise<User> => {
    const response = await api.post<AuthResponse>('/api/auth/register', {
      full_name: fullName,
      email,
      password,
      role: role || 'citizen'
    });

    const { access_token, user: newUser } = response.data;
    localStorage.setItem('landsync_token', access_token);
    localStorage.setItem('landsync_user', JSON.stringify(newUser));
    setToken(access_token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('landsync_token');
    localStorage.removeItem('landsync_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
        getDefaultDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
