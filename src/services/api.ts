import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'https://mobi-one-backend.vercel.app/api'
const BASE_URL='http://192.168.29.69:3000/api'
export type TimeFilterType = 'day' | 'week' | 'month' | 'all';

export interface SalesReportData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalProductsSold: number;
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

export interface CustomerDto {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface ProductDto {
  _id: string;
  name: string;
}

export interface Bill {
  _id: string;
  customer: CustomerDto; // Populated customer
  userId: string;
  items: {
    product: ProductDto; // Populated product
    quantity: number;
    price?: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'Online';
  amountPaid: number;
  status: 'Paid' | 'Pending';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardTotals {
  totalSalesAllTime: number;
  totalPendingAmountAllTime: number;
}

export interface BillsCountResponse {
  totalBills: number;
}

export interface ProductCountResponse {
  totalProducts: number;
}

export interface TotalStockResponse {
  totalStock: number;
}

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

// Refresh token on 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    // Do not handle if no response, non-401, already retried, or calling refresh itself
    if (!status || status !== 401 || originalRequest?.__isRetryRequest || (originalRequest?.url || '').includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        return Promise.reject(error);
      }

      const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const raw = refreshResponse.data || {};
      const newToken = raw?.token || raw?.access_token;
      const newRefreshToken = raw?.refreshToken || raw?.refresh_token;

      if (newToken) {
        await AsyncStorage.setItem('token', String(newToken));
      }
      if (newRefreshToken) {
        await AsyncStorage.setItem('refreshToken', String(newRefreshToken));
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      (originalRequest as any).__isRetryRequest = true;

      return api.request(originalRequest);
    } catch (refreshErr) {
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
      return Promise.reject(refreshErr);
    }
  }
);

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
  token: string;
  refreshToken?: string;
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

      const refreshToken = raw?.refreshToken || raw?.refresh_token;
      return {
        user: raw?.user,
        token,
        refreshToken,
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

  refresh: async (refreshToken: string): Promise<{ token: string; refreshToken?: string }> => {
    const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
    const raw = response.data || {};
    return {
      token: raw?.token || raw?.access_token,
      refreshToken: raw?.refreshToken || raw?.refresh_token,
    };
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
  list: async (q?: string, page?: number, limit?: number): Promise<any[]> => {
    const res = await api.get<any[]>(`/products`, { params: { q, page, limit } });
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
  getTotalCount: async (): Promise<ProductCountResponse> => {
    const res = await api.get<ProductCountResponse>(`/products/dashboard/count`);
    return res.data;
  },
  getTotalStock: async (): Promise<TotalStockResponse> => {
    const res = await api.get<TotalStockResponse>(`/products/dashboard/stock`);
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
  listPaged: async (page: number, limit: number) => {
    const res = await api.get(`/bills`, { params: { page, limit } });
    return res.data; // { bills, total, page, limit, totalPages }
  },
  update: async (id: string, data: Partial<any>) => {
    const res = await api.patch(`/bills/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/bills/${id}`);
    return res.data;
  },
  getDashboardTotals: async (): Promise<DashboardTotals> => {
    const res = await api.get(`/bills/dashboard/totals`);
    return res.data;
  },
  getTotalCount: async (): Promise<BillsCountResponse> => {
    const res = await api.get<BillsCountResponse>(`/bills/total/count`);
    return res.data;
  },
};
export const getSalesReport = async (timeFilter: TimeFilterType = 'all'): Promise<SalesReportData> => {
  const response = await api.get(`/bills/sales-report?timeFilter=${timeFilter}`);
  return response.data;
};

// ---------------- NOTIFICATIONS ----------------
export type NotificationType = 
  | 'PRODUCT_CREATED' 
  | 'PRODUCT_UPDATED' 
  | 'PRODUCT_DELETED' 
  | 'LOW_STOCK' 
  | 'PAYMENT_PENDING' 
  | 'BILL_CREATED' 
  | 'BRAND_CREATED' 
  | 'BRAND_UPDATED' 
  | 'BRAND_DELETED';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const notificationsApi = {
  list: async (page: number = 1, limit: number = 10, isRead?: boolean): Promise<NotificationsResponse> => {
    const params: any = { page, limit };
    if (isRead !== undefined) {
      params.read = isRead;
    }
    const res = await api.get<NotificationsResponse>('/notifications', { params });
    return res.data;
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const res = await api.get<{ unreadCount: number }>('/notifications/unread/count');
    return res.data;
  },

  getByType: async (type: NotificationType, page: number = 1, limit: number = 10): Promise<NotificationsResponse> => {
    const res = await api.get<NotificationsResponse>(`/notifications/type/${type}`, { params: { page, limit } });
    return res.data;
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const res = await api.patch<Notification>(`/notifications/${notificationId}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const res = await api.patch<{ success: boolean }>('/notifications/read-all');
    return res.data;
  },

  delete: async (notificationId: string): Promise<{ success: boolean }> => {
    const res = await api.delete<{ success: boolean }>(`/notifications/${notificationId}`);
    return res.data;
  },

  deleteAll: async (): Promise<{ success: boolean }> => {
    const res = await api.delete<{ success: boolean }>('/notifications');
    return res.data;
  },
};

// ---------------- TRANSACTIONS ----------------
export type TransactionType = 'BILL_CREATED' | 'BILL_UPDATED';

export interface TransactionDto {
  _id: string;
  userId: string;
  billId: string;
  type: TransactionType;
  title: string;
  message: string;
  action?: string;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  transactions: TransactionDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const transactionsApi = {
  create: async (data: { billId: string; type: TransactionType; title: string; message: string; action?: string; data?: Record<string, any> }): Promise<TransactionDto> => {
    const res = await api.post<TransactionDto>(`/transactions`, data);
    return res.data;
  },
  list: async (page: number = 1, limit: number = 10): Promise<TransactionsResponse> => {
    const res = await api.get<TransactionsResponse>(`/transactions`, { params: { page, limit } });
    return res.data;
  },
  getById: async (id: string): Promise<TransactionDto | null> => {
    const res = await api.get<TransactionDto | null>(`/transactions/${id}`);
    return res.data;
  },
  listByBill: async (billId: string, page: number = 1, limit: number = 10): Promise<TransactionsResponse> => {
    const res = await api.get<TransactionsResponse>(`/transactions/bill/${billId}`, { params: { page, limit } });
    return res.data;
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete<{ success: boolean }>(`/transactions/${id}`);
    return res.data;
  },
  removeAll: async (): Promise<{ success: boolean }> => {
    const res = await api.delete<{ success: boolean }>(`/transactions`);
    return res.data;
  },
};
