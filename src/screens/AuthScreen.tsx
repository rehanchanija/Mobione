import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

const AuthScreen = () => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = useCallback(() => setShowPassword(prev => !prev), []);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const validateEmail = (email: string) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const isLoginValid = () => {
    return (
      loginData.email.trim() !== '' &&
      validateEmail(loginData.email) &&
      loginData.password.length >= 6
    );
  };

  const { login, isLoading, error } = useAuth();

  const handleLogin = () => {
    if (!isLoginValid()) {
      Alert.alert('Error', 'Please fill in all fields correctly.');
      return;
    }
    login(loginData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#667eea', '#667eea']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoIcon}>📱</Text>
                </View>
                <Text style={styles.appTitle}>MobiOne</Text>
              </View>

              {/* Login Form */}
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Welcome Back!</Text>
                <Text style={styles.formSubtitle}>Sign in to your account</Text>

                {/* Email */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    placeholder="Email Address"
                    value={loginData.email}
                    onChangeText={(text) => setLoginData({ ...loginData, email: text })}
                    keyboardType="email-address"
                    style={styles.textInput}
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    placeholder="Password"
                    value={loginData.password}
                    onChangeText={(text) => setLoginData({ ...loginData, password: text })}
                    secureTextEntry={!showPassword}
                    style={styles.textInput}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity onPress={togglePassword}>
                    <Text style={styles.passwordToggleText}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {error && <Text style={styles.errorText}>{error.message}</Text>}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    {
                      opacity: isLoginValid() ? 1 : 0.6,
                      backgroundColor: isLoginValid() ? '#667eea' : '#cccccc',
                    },
                  ]}
                  onPress={handleLogin}
                  disabled={!isLoginValid() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  container: { flex: 1 },
  gradient: { flex: 1 },
  logoSection: { 
    alignItems: 'center', 
    marginBottom: 40,
    width: '100%',
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: { fontSize: 32 },
  appTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#fff',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignSelf: 'center',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: { fontSize: 18, marginRight: 12 },
  textInput: { 
    flex: 1, 
    paddingVertical: 16, 
    fontSize: 16, 
    color: '#1a1a1a',
  },
  passwordToggleText: { fontSize: 18 },
  forgotPassword: { 
    alignSelf: 'center', 
    padding: 8,
    marginBottom: 8,
  },
  forgotPasswordText: { 
    color: '#667eea', 
    fontSize: 14, 
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: { 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AuthScreen;