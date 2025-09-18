import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  android: 'http://10.155.160.71:3000', // your phone/PC local IP
});

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
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
    const response = await api.get<Profile>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<Profile> => {
    const response = await api.put<Profile>('/users/profile', data);
    return response.data;
  },
};