import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const appNameTranslateY = useRef(new Animated.Value(100)).current;
  const appNameOpacity = useRef(new Animated.Value(0)).current;
  const welcomeTranslateY = useRef(new Animated.Value(30)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  const { isAuthenticated, isLoading, tokenValid } = useAuthContext();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        await startAnimations();

        // small delay so splash is visible for ~3.5s
        // During this time, all data is being fetched in the background
        await new Promise(resolve => setTimeout(resolve, 3500));

        if (!isLoading) {
          // If token is not valid, redirect to login regardless of isAuthenticated
          if (!tokenValid) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'AuthScreen' as never }],
            });
            return;
          }

          if (isAuthenticated) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' as never }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'AuthScreen' as never }],
            });
          }
        }
      } catch (error) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AuthScreen' as never }],
        });
      }
    };

    checkAuthAndNavigate();
  }, [isLoading, isAuthenticated, tokenValid]);

  const startAnimations = () => {
    // Simple sequence: fade in logo, then text
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(appNameTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(appNameOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(welcomeTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(welcomeOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const progressWidthInterpolate = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.gradient}>
        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              },
            ]}
          >
            <Text style={styles.logoIcon}>📱</Text>
          </Animated.View>

          {/* App Name */}
          <Animated.Text
            style={[
              styles.appName,
              {
                transform: [{ translateY: appNameTranslateY }],
                opacity: appNameOpacity,
              },
            ]}
          >
            MobiOne
          </Animated.Text>

          {/* Welcome Message */}
          <Animated.Text
            style={[
              styles.welcomeMessage,
              {
                transform: [{ translateY: welcomeTranslateY }],
                opacity: welcomeOpacity,
              },
            ]}
          >
            Welcome to MobiOne
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: taglineOpacity,
              },
            ]}
          >
            ALL-IN-ONE MOBILE STORE SOLUTION
          </Animated.Text>

          {/* Loading Container */}
          <Animated.View
            style={[
              styles.loadingContainer,
              {
                opacity: loadingOpacity,
              },
            ]}
          >
            <Text style={styles.loadingText}>Loading your experience...</Text>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressWidthInterpolate,
                  },
                ]}
              />
            </View>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1.5,
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: 180,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
});
