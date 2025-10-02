import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  authApi, 
  LoginData, 
  RegisterData, 
  AuthResponse, 
  profileApi, 
  Profile, 
  UpdateProfileData,
  brandsApi,
  BrandDto,
  productsApi,
  categoriesApi,
  CategoryDto,
  customersApi,
  CreateCustomerDto,
  billsApi,
  CreateBillDto,
  BillItemInput,
  api
} from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';

// Brand hooks implementation
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

const updateBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      brandsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

const deleteBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brands', variables.brandId, 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Also invalidate brand products if the product has a brandId
      if (variables.data.brandId) {
        queryClient.invalidateQueries({ queryKey: ['brands', variables.data.brandId, 'products'] });
      }
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
    },
  });
};

export const useAuth = () => {
  const navigation = useNavigation();
  const { initialize } = useAuthContext();

  const loginMutation = useMutation<AuthResponse, Error, LoginData>({
    mutationFn: async (loginData) => {
      console.log('Attempting login with:', { email: loginData.email });
      return authApi.login(loginData);
    },
    onSuccess: async (data) => {
      console.log('Login Success:', data);

  if (data?.token) {
    await AsyncStorage.setItem('token', String(data.token));
  } else {
    console.warn('No token found in response');
  }

  if (data?.user) {
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
  } else {
    console.warn('No user found in response');
  }

  await initialize();
  navigation.reset({
    index: 0,
    routes: [{ name: 'MainTabs' as never }],
  });
},

    onError: (error: any) => {
      console.error('Login Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const message = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      Alert.alert('Error', message);
    }
  });

  

  const queryClient = useQueryClient();

  // Profile query
  const [isTokenAvailable, setIsTokenAvailable] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsTokenAvailable(!!token);
    };
    checkToken();
  }, []);

  const { data: profile, isLoading: isProfileLoading, error: profileQueryError, refetch: refetchProfile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const result = await profileApi.getProfile();
        return result;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to fetch profile';
        console.log('Profile query error:', message);
        throw error;
      }
    },
    // Always enabled; interceptor adds Authorization when token exists
    enabled: true,
    retry: false,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation<Profile, Error, UpdateProfileData>({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      // Update profile in cache
      queryClient.setQueryData(['profile'], data);
      Alert.alert('Success', 'Profile updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update profile';
      Alert.alert('Error', message);
    },
  });

  const logout = async () => {
    await AsyncStorage.removeItem('token');
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
  };
};