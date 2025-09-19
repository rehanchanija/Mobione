import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  android: __DEV__
    ? 'http://10.155.160.71:3000'  // Android Emulator
    : 'http://10.155.160.71:3000',  // REPLACE X with your IP's last number

}) 

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests if it exists
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Test connection function

// Auth types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

// Auth API functions
export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with:', { email: data.email });
      console.log('API URL:', `${BASE_URL}/auth/login`);
      
      const response = await api.post<AuthResponse>('/auth/login', data);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      throw error;
    }
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('Attempting registration with:', { 
        email: data.email,
        name: data.name,
        phone: data.phone 
      });
      console.log('API URL:', `${BASE_URL}/auth/register`);
      
      const response = await api.post<AuthResponse>('/auth/register', data);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      throw error;
    }
  },
};

// Profile types
export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  shopName?: string;
  shopDetails?: string;
}

export interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
  shopName?: string;
  shopDetails?: string;
}

// Profile API functions
export const profileApi = {
  getProfile: async (): Promise<Profile> => {
    try {
      // Log token before making request
      const token = await AsyncStorage.getItem('token');
      console.log('Getting profile with token:', token ? 'Token exists' : 'No token');
      console.log('API URL:', `${BASE_URL}/auth/profile`);

      const response = await api.get<Profile>('/auth/profile');
      console.log('Profile response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get profile error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      throw error;
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<Profile> => {
    try {
      console.log('Updating profile with data:', data);
      console.log('API URL:', `${BASE_URL}/auth/profile`);

      const response = await api.put<Profile>('/auth/profile', data);
      console.log('Update profile response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update profile error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      throw error;
    }
  },
};