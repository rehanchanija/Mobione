import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  authApi, 
  LoginData, 
  AuthResponse, 
  profileApi, 
  Profile, 
  UpdateProfileData,
  brandsApi,
  productsApi,
  categoriesApi,
  customersApi,
  billsApi,
  notificationsApi,
  api,
  getSalesReport
} from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { AppState } from 'react-native';

const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsApi.list(),
  });
};

const useBrandTotal = () => {
  return useQuery({
    queryKey: ['brands', 'total'],
    queryFn: () => brandsApi.total(),
  });
};

const useBrandProducts = (brandId: string) => {
  return useQuery({
    queryKey: ['brands', brandId, 'products'],
    queryFn: () => brandsApi.products(brandId),
    enabled: !!brandId,
  });
};

const useBrandStock = (brandId: string) => {
  return useQuery({
    queryKey: ['brands', brandId, 'stock'],
    queryFn: () => brandsApi.stockTotal(brandId),
    enabled: !!brandId,
  });
};

const useBrandProductCount = (brandId: string) => {
  return useQuery({
    queryKey: ['brands', brandId, 'productCount'],
    queryFn: () => brandsApi.productCount(brandId),
    enabled: !!brandId,
  });
};

// Brand mutation hooks
const createBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => brandsApi.create(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      showMessage({
        message: 'Success',
        description: `Brand "${data.name}" created successfully`,
        type: 'success',
      });
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Failed to create brand';
      showMessage({
        message: 'Error',
        description: errorMsg,
        type: 'danger',
      });
    },
  });
};

const updateBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      brandsApi.update(id, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      showMessage({
        message: 'Success',
        description: `Brand "${data.name}" updated successfully`,
        type: 'success',
      });
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Failed to update brand';
      showMessage({
        message: 'Error',
        description: errorMsg,
        type: 'danger',
      });
    },
  });
};

const deleteBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      showMessage({
        message: 'Success',
        description: 'Brand deleted successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Failed to delete brand';
      showMessage({
        message: 'Error',
        description: errorMsg,
        type: 'danger',
      });
    },
  });
};

const createBrandProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ brandId, productData }: { brandId: string; productData: any }) => {
      // Use api.post directly since productsApi doesn't have a create method
      const res = await api.post('/products', { ...productData, brandId });
      return res.data;
    },
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brands', variables.brandId, 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      showMessage({
        message: 'Success',
        description: `Product "${data.name}" created successfully`,
        type: 'success',
      });
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Failed to create product';
      showMessage({
        message: 'Error',
        description: errorMsg,
        type: 'danger',
      });
    },
  });
};

// Product hooks implementation
const useProducts = (params?: any) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
  });
};

const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
};

const updateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      productsApi.update(id, data),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Also invalidate brand products if the product has a brandId
      if (variables.data.brandId) {
        queryClient.invalidateQueries({ queryKey: ['brands', variables.data.brandId, 'products'] });
      }
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      showMessage({
        message: 'Success',
        description: `Product "${data.name}" updated successfully`,
        type: 'success',
      });
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Failed to update product';
      showMessage({
        message: 'Error',
        description: errorMsg,
        type: 'danger',
      });
    },
  });
};

const deleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // We don't know which brand this product belonged to, so invalidate all brand products
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      showMessage({
        message: 'Success',
        description: 'Product deleted successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Failed to delete product';
      showMessage({
        message: 'Error',
        description: errorMsg,
        type: 'danger',
      });
    },
  });
};

// Category mutations
const updateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) => 
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

const deleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useAuth = () => {
  const navigation = useNavigation();
  const { initialize } = useAuthContext();

  const loginMutation = useMutation<AuthResponse, Error, LoginData>({
    mutationFn: async (loginData) => {
      return authApi.login(loginData);
    },
    onSuccess: async (data) => {
      // Store access token
      if (data?.token) {
        await AsyncStorage.setItem('token', String(data.token));
      }

      // Store refresh token
      if (data?.refreshToken) {
        await AsyncStorage.setItem('refreshToken', String((data as any).refreshToken));
      }

      // Store user info
      if (data?.user) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
      }

      // Reinitialize auth context and navigate
      await initialize();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' as never }],
      });
    },
    onError: (error: any) => {
      showMessage({
        message: 'Login Failed',
        description: error?.response?.data?.message || 'An error occurred during login',
        type: 'danger',
      });
    },
  });

  

  const queryClient = useQueryClient();

  // Notification hooks implementation
  const useNotifications = (page: number = 1, limit: number = 10, isRead?: boolean) => {
    return useQuery({
      queryKey: ['notifications', page, limit, isRead],
      queryFn: () => notificationsApi.list(page, limit, isRead),
      refetchInterval: 3000, // Refetch every 5 seconds for faster updates
      staleTime: 3000, // Data is stale after 3 seconds
    });
  };

  const useUnreadCount = () => {
    return useQuery({
      queryKey: ['notifications', 'unread-count'],
      queryFn: () => notificationsApi.getUnreadCount(),
      refetchInterval: 2000, // Refetch every 3 seconds for real-time feel
      staleTime: 2000, // Data is stale after 2 seconds
    });
  };

 

  const markNotificationAsReadMutation = () => {
    return useMutation({
      mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      },
    });
  };

  const markAllAsReadMutation = () => {
    return useMutation({
      mutationFn: () => notificationsApi.markAllAsRead(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      },
    });
  };

  const deleteNotificationMutation = () => {
    return useMutation({
      mutationFn: (notificationId: string) => notificationsApi.delete(notificationId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    });
  };

  const deleteAllNotificationsMutation = () => {
    return useMutation({
      mutationFn: () => notificationsApi.deleteAll(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    });
  };
  // Profile query

  const [isTokenAvailable, setIsTokenAvailable] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsTokenAvailable(!!token);
    };
    checkToken();
    
    // Also check when app comes to foreground (for refresh scenarios)
    const subscription = AppState.addEventListener('change', checkToken);
    return () => subscription.remove();
  }, []);

  const { data: profile, isLoading: isProfileLoading, error: profileQueryError, refetch: refetchProfile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const result = await profileApi.getProfile();
        return result;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to fetch profile';
        throw error;
      }
    },
    // Always enable - let interceptor handle 401
    enabled: isTokenAvailable,
    retry: 2, // Retry twice to allow interceptor to refresh
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation<Profile, Error, UpdateProfileData>({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      // Update profile in cache
      queryClient.setQueryData(['profile'], data);
      showMessage({ message: 'Profile updated successfully', type: 'success' });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update profile';
      showMessage({ message: message, type: 'danger' });
    },
  });

  // Bills hooks implementation
  const useBills = (page: number, limit: number) => {
    return useQuery({
      queryKey: ['bills', page, limit],
      queryFn: () => billsApi.listPaged(page, limit),
      refetchInterval: 5000, // Refetch every 5 seconds
    });
  };

  const useDashboardTotals = () => {
    return useQuery({
      queryKey: ['bills', 'dashboard-totals'],
      queryFn: () => billsApi.getDashboardTotals(),
      refetchInterval: 10000, // Refetch every 20 seconds
    });
  };

  const useTotalBillsCount = () => {
    return useQuery({
      queryKey: ['bills', 'total-count'],
      queryFn: () => billsApi.getTotalCount(),
      refetchInterval: 10000,
    });
  };

  const useTotalProductsCount = () => {
    return useQuery({
      queryKey: ['products', 'total-count'],
      queryFn: () => productsApi.getTotalCount(),
      refetchInterval: 10000, // Refetch every 20 seconds
    });
  };

  const useTotalStock = () => {
    return useQuery({
      queryKey: ['products', 'total-stock'],
      queryFn: () => productsApi.getTotalStock(),
      refetchInterval: 10000, // Refetch every 20 seconds
    });
  };

  const useSalesReport = (timeFilter: 'day' | 'week' | 'month' | 'all') => {
    return useQuery({
      queryKey: ['sales-report', timeFilter],
      queryFn: () => getSalesReport(timeFilter),
      refetchInterval: 10000,
    });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
    // Clear all queries from cache on logout
    queryClient.clear();
    await initialize();
    navigation.reset({
      index: 0,
      routes: [{ name: 'AuthScreen' as never }],
    });
  };

  return {
    // Auth
    login: loginMutation.mutate,
    logout,
    profile,
    refetchProfile,
    updateProfile: updateProfileMutation.mutate,
    isLoading: loginMutation.isPending,
    isProfileLoading,

    // Bills
    // useBill,
    isUpdatingProfile: updateProfileMutation.isPending,
    error: loginMutation.error,
    profileError: profileQueryError,
    
    // Expose all APIs directly
    authApi,
    profileApi,
    brandsApi,
    productsApi,
    categoriesApi,
    customersApi,
    billsApi,
    notificationsApi,
    
    // React Query hooks for brands
    useBrands,
    useBrandTotal,
    useBrandProducts,
    useBrandStock,
    useBrandProductCount,
    createBrandMutation,
    updateBrandMutation,
    deleteBrandMutation,
    createBrandProductMutation,
    
    // React Query hooks for products
    useProducts,
    useProduct,
    updateProductMutation,
    deleteProductMutation,
    useTotalProductsCount,
    useTotalStock,
    useSalesReport,

    // React Query hooks for categories
    updateCategoryMutation,
    deleteCategoryMutation,

    // React Query hooks for bills
    useBills,
    useDashboardTotals,
    useTotalBillsCount,

    // React Query hooks for notifications
    useNotifications,
    useUnreadCount,
    // useNotificationsByType,
    markNotificationAsReadMutation,
    markAllAsReadMutation,
    deleteNotificationMutation,
    deleteAllNotificationsMutation,

  };
};
