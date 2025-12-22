import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  tokenValid: boolean;
  prefetchCriticalData: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const BASE_URL = 'https://mobi-one-backend.vercel.app/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);

  const prefetchCriticalData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) return; // No token, can't prefetch
      
      const headers = { Authorization: `Bearer ${token}` };
      const axiosConfig = { headers, timeout: 5000 };

      // Prefetch critical data in parallel
      // These are the most important data for the home screen and dashboard
      await Promise.allSettled([
        axios.get(`${BASE_URL}/auth/profile`, axiosConfig),
        axios.get(`${BASE_URL}/brands`, axiosConfig),
        axios.get(`${BASE_URL}/products?page=1&limit=50`, axiosConfig),
        axios.get(`${BASE_URL}/categories`, axiosConfig),
        axios.get(`${BASE_URL}/bills?page=1&limit=20`, axiosConfig),
        axios.get(`${BASE_URL}/transactions?page=1&limit=20`, axiosConfig),
        axios.get(`${BASE_URL}/notifications?page=1&limit=10`, axiosConfig),
        axios.get(`${BASE_URL}/notifications/unread-count`, axiosConfig),
      ]);

      console.log('✅ Critical data prefetched successfully');
    } catch (error) {
      console.log('⚠️ Prefetch failed - will fetch on demand', error);
      // Fail silently - data will be fetched on demand
    }
  };

  const initialize = async () => {
    try {
      // Reset states at start of initialization
      setIsLoading(true);
      setTokenValid(true);
      
      const token = await AsyncStorage.getItem('token');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setTokenValid(false);
        setIsLoading(false);
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
        
        // Start prefetching critical data in the background
        prefetchCriticalData();
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
              
              // Start prefetching with new token
              prefetchCriticalData();
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
      console.error('Initialize error:', error);
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
    <AuthContext.Provider value={{ isAuthenticated, isLoading, initialize, tokenValid, prefetchCriticalData }}>
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
