import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginData, RegisterData, AuthResponse, profileApi, Profile, UpdateProfileData } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';

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
    login: loginMutation.mutate,
    logout,
    profile,
    refetchProfile,
    updateProfile: updateProfileMutation.mutate,
    isLoading: loginMutation.isPending ,
    isProfileLoading,
    isUpdatingProfile: updateProfileMutation.isPending,
    error: loginMutation.error ,
    profileError: profileQueryError,
  };
};