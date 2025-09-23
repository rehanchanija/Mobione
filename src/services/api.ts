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
    phone?: string;
    shopName?: string;
    shopDetails?: string;
  };
  token: string; // normalized token (could be backend access_token)
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', data);
      const raw = response.data as any;
      const token = raw?.token || raw?.access_token;

      if (!token) {
        console.warn('Login succeeded but token is missing in response');
      }

      return {
        user: raw?.user,
        token,
      } as AuthResponse;
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

// ---------------- BRANDS ----------------
export interface BrandDto {
  _id: string;
  name: string;
}

export const brandsApi = {
  list: async (): Promise<BrandDto[]> => {
    const res = await api.get<BrandDto[]>('/brands');
    return res.data;
  },
  total: async (): Promise<{ total: number }> => {
    const res = await api.get<{ total: number }>(`/brands/total`);
    return res.data;
  },
  create: async (data: { name: string }): Promise<BrandDto> => {
    const res = await api.post<BrandDto>('/brands', data);
    return res.data;
  },
  update: async (id: string, data: { name: string }): Promise<BrandDto> => {
    const res = await api.put<BrandDto>(`/brands/${id}`, data);
    return res.data;
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete<{ success: boolean }>(`/brands/${id}`);
    return res.data;
  },
  products: async (brandId: string): Promise<any[]> => {
    const res = await api.get<any[]>(`/brands/${brandId}/products`);
    return res.data;
  },
  createProduct: async (
    brandId: string,
    data: { name: string; description?: string; price: number; stock: number; categoryId: string },
  ): Promise<any> => {
    const res = await api.post<any>(`/brands/${brandId}/products`, data);
    return res.data;
  },
};

// ---------------- PRODUCTS ----------------
export const productsApi = {
  getById: async (id: string): Promise<any> => {
    const res = await api.get<any>(`/products/${id}`);
    return res.data;
  },
  update: async (
    id: string,
    data: Partial<{ name: string; description?: string; price: number; stock: number; brandId: string; categoryId: string }>,
  ): Promise<any> => {
    const res = await api.put<any>(`/products/${id}`, data);
    return res.data;
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete<{ success: boolean }>(`/products/${id}`);
    return res.data;
  },
};

// ---------------- CATEGORIES ----------------
export interface CategoryDto {
  _id: string;
  name: string;
}

export const categoriesApi = {
  list: async (): Promise<CategoryDto[]> => {
    const res = await api.get<CategoryDto[]>(`/categories`);
    return res.data;
  },
  create: async (data: { name: string }): Promise<CategoryDto> => {
    const res = await api.post<CategoryDto>(`/categories`, data);
    return res.data;
  },
};