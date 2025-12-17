import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  tokenValid: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

const BASE_URL = 'https://mobi-one-backend.vercel.app/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);

  const initialize = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setTokenValid(false);
        return;
      }

      // Try to validate token by making a simple request
      try {
        await axios.get(`${BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });
        setIsAuthenticated(true);
        setTokenValid(true);
      } catch (error: any) {
        // Token expired or invalid - try refresh
        if (error?.response?.status === 401 && refreshToken) {
          try {
            const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
            const newToken = refreshResponse.data?.access_token || refreshResponse.data?.token;
            const newRefreshToken = refreshResponse.data?.refresh_token || refreshResponse.data?.refreshToken;

            if (newToken) {
              await AsyncStorage.setItem('token', String(newToken));
              setIsAuthenticated(true);
              setTokenValid(true);
            } else {
              throw new Error('No token in refresh response');
            }

            if (newRefreshToken) {
              await AsyncStorage.setItem('refreshToken', String(newRefreshToken));
            }
          } catch (refreshError: any) {
            // Refresh failed - user needs to login again
            await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
            setIsAuthenticated(false);
            setTokenValid(false);
          }
        } else {
          // Other error or no refresh token - logout
          await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
          setIsAuthenticated(false);
          setTokenValid(false);
        }
      }
    } catch (error) {
      setIsAuthenticated(false);
      setTokenValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, initialize, tokenValid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
