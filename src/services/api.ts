import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ✅ Safer BASE_URL handling
const BASE_URL =
  Platform.OS === 'android'
    ? 'http://192.168.29.69:3000'
    : 'http://192.168.29.69:3000';

export type TimeFilterType = 'day' | 'week' | 'month' | 'all';

export interface SalesReportData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  dailyStats: {
    date: string;
    sales: number;
    orders: number;
  }[];
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  timeFilter: TimeFilterType;
}

// Transaction interfaces
export interface Transaction {
  _id: string;
  billId: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  billId: string;
  amount: number;
  type: string;
  description?: string;
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ---------------- TRANSACTIONS ----------------
export const transactionApi = {
  getAll: async (): Promise<Transaction[]> => {
    try {
      console.log('Fetching transactions...');
      const token = await AsyncStorage.getItem('token');
      console.log('Auth token:', token);
      
      const response = await api.get('/transactions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Transaction API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Transaction API error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

 

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
};

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
  stockTotal: async (brandId: string): Promise<{ stockTotal: number }> => {
    const res = await api.get<{ stockTotal: number }>(`/brands/${brandId}/stock`);
    return res.data;
  },
  productCount: async (brandId: string): Promise<{ productCount: number }> => {
    const res = await api.get<{ productCount: number }>(`/brands/${brandId}/product-count`);
    return res.data;
  },
  createProduct: async (
    brandId: string,
    data: { name: string; description?: string; barcode?: string; price: number; stock: number; categoryId: string },
  ): Promise<any> => {
    const res = await api.post<any>(`/brands/${brandId}/products`, data);
    return res.data;
  },
};

// ---------------- PRODUCTS ----------------
export const productsApi = {
  list: async (q?: string): Promise<any[]> => {
    const res = await api.get<any[]>(`/products`, { params: { q } });
    return res.data;
  },
  getById: async (id: string): Promise<any> => {
    const res = await api.get<any>(`/products/${id}`);
    return res.data;
  },
  update: async (
    id: string,
    data: Partial<{ name: string; description?: string; barcode?: string; price: number; stock: number; brandId: string; categoryId: string }>,
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

// ---------------- CUSTOMERS & BILLS ----------------
export interface CreateCustomerDto {
  name: string;
  phone?: string;
  address?: string;
}

export interface BillItemInput { productId: string; quantity: number }
export interface CreateBillDto {
  customerId?: string;
  customer?: CreateCustomerDto;
  items: BillItemInput[];
  discount?: number;
  paymentMethod: 'Cash' | 'Online';
  amountPaid: number;
}

export const customersApi = {
  create: async (data: CreateCustomerDto) => {
    const res = await api.post(`/bills/customers`, data);
    return res.data;
  },
  list: async () => {
    const res = await api.get(`/bills/customers`);
    return res.data;
  },
};

export const billsApi = {
  create: async (data: CreateBillDto) => {
    const res = await api.post(`/bills`, data);
    return res.data;
  },
  get: async (id: string) => {
    const res = await api.get(`/bills/${id}`);
    return res.data;
  },
  list: async () => {
    const res = await api.get(`/bills`);
    return res.data;
  },
};
export const getSalesReport = async (timeFilter: TimeFilterType = 'all'): Promise<SalesReportData> => {
  const response = await api.get(`/bills/sales-report?timeFilter=${timeFilter}`);
  return response.data;
};