import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AuthScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const togglePassword = useCallback(() => setShowPassword(prev => !prev), []);
  const toggleConfirmPassword = useCallback(() => setShowConfirmPassword(prev => !prev), []);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [userType, setUserType] = useState<'staff' | 'owner'>('staff');

  const validateEmail = (email: string) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const isLoginValid = () => {
    return loginData.email.trim() !== '' && validateEmail(loginData.email) && loginData.password.length >= 6;
  };

  const isRegisterValid = () => {
    return (
      registerData.fullName.trim() !== '' &&
      registerData.email.trim() !== '' &&
      validateEmail(registerData.email) &&
      registerData.phone.trim() !== '' &&
      registerData.password.length >= 6 &&
      registerData.confirmPassword === registerData.password
    );
  };

  const handleLogin = () => {
    if (!isLoginValid()) {
      Alert.alert('Error', 'Please fill in all fields correctly.');
      return;
    }
    Alert.alert('Success', 'Login successful!', [
      { text: 'OK', onPress: () => navigation.navigate('MainTabs' as never) },
    ]);
  };

  const handleRegister = () => {
    if (!isRegisterValid()) {
      Alert.alert('Error', 'Please fill in all fields correctly.');
      return;
    }
    Alert.alert('Success', `Account created successfully as ${userType}!`, [
      { text: 'OK', onPress: () => navigation.navigate('MainTabs' as never) },
    ]);
  };

  const handleSkip = () => {
    navigation.navigate('MainTabs' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#667eea', '#667eea']} style={styles.gradient}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              {/* Logo Section */}
              <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoIcon}>📱</Text>
                </View>
                <Text style={styles.appTitle}>MobiOne</Text>
              </View>

              {/* Tab Layout */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'login' && styles.activeTabButton]}
                  onPress={() => setActiveTab('login')}
                >
                  <Text style={[styles.tabButtonText, activeTab === 'login' && styles.activeTabButtonText]}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'register' && styles.activeTabButton]}
                  onPress={() => setActiveTab('register')}
                >
                  <Text style={[styles.tabButtonText, activeTab === 'register' && styles.activeTabButtonText]}>Register</Text>
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>
                  {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
                </Text>
                <Text style={styles.formSubtitle}>
                  {activeTab === 'login' ? 'Sign in to your account' : 'Join MobiOne today'}
                </Text>

                {activeTab === 'login' && (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputIcon}>📧</Text>
                      <TextInput
                        placeholder="Email Address"
                        value={loginData.email}
                        onChangeText={(text) => setLoginData({ ...loginData, email: text })}
                        keyboardType="email-address"
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputIcon}>🔒</Text>
                      <TextInput
                        placeholder="Password"
                        value={loginData.password}
                        onChangeText={(text) => setLoginData({ ...loginData, password: text })}
                        secureTextEntry={!showPassword}
                        style={styles.textInput}
                      /> 
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Text style={styles.passwordToggleText}>{showPassword ? '🙈' : '👁️'}</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.forgotPassword}>
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </>
                )}

               {activeTab === 'register' && (
  <>
    <View style={styles.inputContainer}>
      <Text style={styles.inputIcon}>👤</Text>
      <TextInput
        placeholder="Full Name"
        value={registerData.fullName}
        onChangeText={(text) => setRegisterData({ ...registerData, fullName: text })}
        style={styles.textInput}
      />
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.inputIcon}>📧</Text>
      <TextInput
        placeholder="Email Address"
        value={registerData.email}
        onChangeText={(text) => setRegisterData({ ...registerData, email: text })}
        keyboardType="email-address"
        style={styles.textInput}
      />
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.inputIcon}>📱</Text>
      <TextInput
        placeholder="Phone Number"
        value={registerData.phone}
        onChangeText={(text) => setRegisterData({ ...registerData, phone: text })}
        keyboardType="phone-pad"
        style={styles.textInput}
      />
    </View>

    {/* Password Field */}
    <View style={styles.inputContainer}>
      <Text style={styles.inputIcon}>🔒</Text>
      <TextInput
        placeholder="Password"
        value={registerData.password}
        onChangeText={(text) => setRegisterData({ ...registerData, password: text })}
        secureTextEntry={!showPassword} // <-- toggle password
        style={styles.textInput}
      />
      <Pressable onPress={togglePassword}>
        <Text style={styles.passwordToggleText}>{showPassword ? '🙈' : '👁️'}</Text>
      </Pressable>
    </View>

    {/* Confirm Password Field */}
    <View style={styles.inputContainer}>
      <Text style={styles.inputIcon}>🔒</Text>
      <TextInput
        placeholder="Confirm Password"
        value={registerData.confirmPassword}
        onChangeText={(text) => setRegisterData({ ...registerData, confirmPassword: text })}
        secureTextEntry={!showConfirmPassword} // <-- toggle confirm password
        style={styles.textInput}
      />
      <Pressable onPress={toggleConfirmPassword}>
        <Text style={styles.passwordToggleText}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
      </Pressable>
    </View>
  </>
)}


                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    {
                      opacity: (activeTab === 'login' ? isLoginValid() : isRegisterValid()) ? 1 : 0.6,
                      backgroundColor: (activeTab === 'login' ? isLoginValid() : isRegisterValid()) ? '#667eea' : '#cccccc',
                    },
                  ]}
                  onPress={activeTab === 'login' ? handleLogin : handleRegister}
                  disabled={!(activeTab === 'login' ? isLoginValid() : isRegisterValid())}
                >
                  <Text style={styles.submitButtonText}>{activeTab === 'login' ? 'Login' : 'Register'}</Text>
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
  container: { flex: 1 },
  gradient: { flex: 1 },
 skipButton: {
  alignSelf: 'flex-end',
  marginTop: 50, // more space from top
  marginRight: 24, // a bit more right padding
  paddingHorizontal: 12, // optional padding for touch area
  paddingVertical: 6,
  borderRadius: 20,
  backgroundColor: 'rgba(255,255,255,0.2)', // subtle background
},

skipButtonText: {
  color: '#fff',
  fontSize: 18, // increased font size
  fontWeight: '600', // slightly bolder
  letterSpacing: 0.5, // a bit of spacing for modern look
},logoSection: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  logoContainer: { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoIcon: { fontSize: 32 },
  appTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 25, marginHorizontal: 32, marginBottom: 30, padding: 4 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 21 },
  activeTabButton: { backgroundColor: '#fff' },
  tabButtonText: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  activeTabButtonText: { color: '#667eea' },
  formContainer: { backgroundColor: '#fff', marginHorizontal: 24, borderRadius: 16, padding: 24 },
  formTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginBottom: 8 },
  formSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, backgroundColor: '#f9f9f9' },
  inputIcon: { fontSize: 18, marginRight: 12 },
  textInput: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#1a1a1a' },
  passwordToggleText: { fontSize: 18 },
  forgotPassword: { alignSelf: 'flex-end', padding: 8 },
  forgotPasswordText: { color: '#667eea', fontSize: 14, fontWeight: '500' },
  submitButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AuthScreen;
