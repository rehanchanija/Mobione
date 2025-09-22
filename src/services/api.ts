import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ✅ Safer BASE_URL handling
const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.155.160.71:3000'
    : 'http://10.155.160.71:3000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ✅ Attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------- AUTH ----------------
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

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
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
};

// ---------------- PROFILE ----------------
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

export const profileApi = {
  getProfile: async (): Promise<Profile> => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('📌 Getting profile, token:', token);

      // ✅ Adjust this endpoint if Postman uses `/api/auth/profile`
      const response = await api.get<Profile>('/auth/profile');
      console.log('✅ Profile response:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('❌ Get profile error details:', {
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
      console.log('📌 Updating profile with:', data);

      // ✅ Adjust endpoint if Postman uses `/api/auth/profile`
      const response = await api.put<Profile>('/auth/profile', data);
      console.log('✅ Update profile response:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('❌ Update profile error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      throw error;
    }
  },
};
