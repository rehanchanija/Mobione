import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginData, RegisterData, AuthResponse, profileApi, Profile, UpdateProfileData } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

export const useAuth = () => {
  const navigation = useNavigation();

  const loginMutation = useMutation<AuthResponse, Error, LoginData>({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      navigation.navigate('MainTabs' as never);
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
  const { data: profile, isLoading: isProfileLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
    enabled: !!AsyncStorage.getItem('token'), // Only fetch if token exists
    retry: false,
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
    navigation.navigate('Auth' as never);
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