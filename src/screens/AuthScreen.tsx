// AuthScreen.js
import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  KeyboardTypeOptions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions; // ✅ correct type
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  showPassword?: boolean;
  icon: string;
}


interface RadioButtonProps {
  selected: boolean;
  onPress: () => void;
  label: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'owner' | 'staff';
}

type TabType = 'login' | 'register';

const { width, height } = Dimensions.get('window');

const AuthScreen = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  
  // State management
    const [activeTab, setActiveTab] = useState<TabType>('login');
  const [userType, setUserType] = useState('staff');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  // Animation values
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  useEffect(() => {
    // Animate tab switch
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: activeTab === 'login' ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab]);
  
  const handleTabSwitch = (tab: TabType) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      // Clear form data when switching tabs
      if (tab === 'login') {
        setLoginData({ email: '', password: '' });
      } else {
        setRegisterData({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
        });
      }
    }
  };
  
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
  
  const handleLogin = async () => {
    if (!isLoginValid()) {
      Alert.alert('Error', 'Please fill in all fields correctly.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Login successful!', [
        { text: 'OK', onPress: () => navigation.navigate('MainTabs') }
      ]);
    }, 2000);
  };
  
  const handleRegister = async () => {
    if (!isRegisterValid()) {
      Alert.alert('Error', 'Please fill in all fields correctly.');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', `Account created successfully as ${userType}!`, [
        { text: 'OK', onPress: () => navigation.navigate('MainTabs') }
      ]);
    }, 2000);
  };
  
  const handleSkip = () => {
    navigation.navigate('MainTabs');
  };
  
  const TabButton = ({ title, isActive, onPress }: TabButtonProps) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
  
  const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
  showPasswordToggle = false,
  onTogglePassword,
  showPassword,
  icon,
}) => (
  <View style={styles.inputContainer}>
    {icon && <Text style={styles.inputIcon}>{icon}</Text>}
    <TextInput
      style={[styles.textInput, icon && styles.textInputWithIcon]}
      placeholder={placeholder}
      placeholderTextColor="rgba(26, 26, 26, 0.6)"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}  // ✅ Now correctly typed
      secureTextEntry={secureTextEntry && !showPassword}
      autoCapitalize="none"
    />
    {showPasswordToggle && (
      <TouchableOpacity
        style={styles.passwordToggle}
        onPress={onTogglePassword}
      >
        <Text style={styles.passwordToggleText}>
          {showPassword ? "🙈" : "👁️"}
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

  
  const RadioButton = ({ selected, onPress, label }: RadioButtonProps) => (
    <TouchableOpacity
      style={styles.radioContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>
        {selected && <View style={styles.radioButtonInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#667eea', '#667eea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Skip Button */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
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
              <TabButton
                title="Login"
                isActive={activeTab === 'login'}
                onPress={() => handleTabSwitch('login')}
              />
              <TabButton
                title="Register"
                isActive={activeTab === 'register'}
                onPress={() => handleTabSwitch('register')}
              />
            </View>
            
            {/* Form Container */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnimation,
                  transform: [{
                    translateX: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0],
                    })
                  }]
                }
              ]}
            >
              {/* Form Title */}
              <Text style={styles.formTitle}>
                {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
              </Text>
              <Text style={styles.formSubtitle}>
                {activeTab === 'login' 
                  ? 'Sign in to your account' 
                  : 'Join MobiOne today'
                }
              </Text>
              
              {/* Login Form */}
              {activeTab === 'login' && (
                <View style={styles.formContent}>
                  <InputField
                    placeholder="Email Address"
                    value={loginData.email}
                    onChangeText={(text) => setLoginData({...loginData, email: text})}
                    keyboardType="email-address"
                    icon="📧"
                  />
                  
                  <InputField
                    placeholder="Password"
                    value={loginData.password}
                    onChangeText={(text:string) => setLoginData({...loginData, password: text})}
                    secureTextEntry={true}
                    showPasswordToggle={true}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    icon="🔒"
                  />
                  
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Register Form */}
              {activeTab === 'register' && (
                <View style={styles.formContent}>
                  <InputField
                    placeholder="Full Name"
                    value={registerData.fullName}
                    onChangeText={(text) => setRegisterData({...registerData, fullName: text})}
                    icon="👤"
                  />
                  
                  <InputField
                    placeholder="Email Address"
                    value={registerData.email}
                    onChangeText={(text) => setRegisterData({...registerData, email: text})}
                    keyboardType="email-address"
                    icon="📧"
                  />
                  
                  <InputField
                    placeholder="Phone Number"
                    value={registerData.phone}
                    onChangeText={(text) => setRegisterData({...registerData, phone: text})}
                    keyboardType="phone-pad"
                    icon="📱"
                  />
                  
                  <InputField
                    placeholder="Password"
                    value={registerData.password}
                    onChangeText={(text) => setRegisterData({...registerData, password: text})}
                    secureTextEntry={true}
                    showPasswordToggle={true}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    icon="🔒"
                  />
                  
                  <InputField
                    placeholder="Confirm Password"
                    value={registerData.confirmPassword}
                    onChangeText={(text) => setRegisterData({...registerData, confirmPassword: text})}
                    secureTextEntry={true}
                    showPasswordToggle={true}
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    icon="🔒"
                  />
                  
                  {/* Password Match Indicator */}
                  {registerData.confirmPassword !== '' && (
                    <Text style={[
                      styles.passwordMatchText,
                      { color: registerData.password === registerData.confirmPassword ? '#4CAF50' : '#F44336' }
                    ]}>
                      {registerData.password === registerData.confirmPassword 
                        ? '✓ Passwords match' 
                        : '✗ Passwords do not match'
                      }
                    </Text>
                  )}
                  
                  {/* User Type Selection */}
                  <View style={styles.userTypeContainer}>
                    <Text style={styles.userTypeTitle}>Account Type</Text>
                    <View style={styles.radioGroup}>
                      <RadioButton
                        selected={userType === 'staff'}
                        onPress={() => setUserType('staff')}
                        label="Staff"
                      />
                      <RadioButton
                        selected={userType === 'owner'}
                        onPress={() => setUserType('owner')}
                        label="Owner"
                      />
                    </View>
                  </View>
                </View>
              )}
              
              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    opacity: (activeTab === 'login' ? isLoginValid() : isRegisterValid()) ? 1 : 0.6,
                    backgroundColor: (activeTab === 'login' ? isLoginValid() : isRegisterValid()) 
                      ? '#667eea' : '#cccccc'
                  }
                ]}
                onPress={activeTab === 'login' ? handleLogin : handleRegister}
                disabled={!(activeTab === 'login' ? isLoginValid() : isRegisterValid()) || isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading 
                    ? (activeTab === 'login' ? 'Logging in...' : 'Creating account...')
                    : (activeTab === 'login' ? 'Login' : 'Register')
                  }
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  skipButton: {
    alignSelf: 'flex-end',
    marginTop: 40,
    marginRight: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    marginHorizontal: 32,
    marginBottom: 30,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 21,
  },
  activeTabButton: {
    backgroundColor: '#ffffff',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeTabButtonText: {
    color: '#667eea',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
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
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  formContent: {
    marginBottom: 24,
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
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textInputWithIcon: {
    marginLeft: 0,
  },
  passwordToggle: {
    padding: 4,
  },
  passwordToggleText: {
    fontSize: 18,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  passwordMatchText: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  userTypeContainer: {
    marginTop: 16,
  },
  userTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#667eea',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#667eea',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  radioLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AuthScreen;