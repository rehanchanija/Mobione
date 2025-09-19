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
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await initialize();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' as never }],
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Error', message);
    }
  });

  const registerMutation = useMutation<AuthResponse, Error, RegisterData>({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      navigation.navigate('CreateProfile' as never);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
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

  const { data: profile, isLoading: isProfileLoading, error: profileQueryError } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const result = await profileApi.getProfile();
        return result;
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to fetch profile';
        console.error('Profile fetch error:', error);
        Alert.alert('Error', message);
        throw error;
      }
    },
    enabled: isTokenAvailable,
    retry: false
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
    register: registerMutation.mutate,
    logout,
    profile,
    updateProfile: updateProfileMutation.mutate,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    isProfileLoading,
    isUpdatingProfile: updateProfileMutation.isPending,
    error: loginMutation.error || registerMutation.error,
    profileError: updateProfileMutation.error,
  };
};