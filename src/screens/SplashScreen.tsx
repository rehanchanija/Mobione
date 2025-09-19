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
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const appNameTranslateY = useRef(new Animated.Value(100)).current;
  const appNameOpacity = useRef(new Animated.Value(0)).current;
  const welcomeTranslateY = useRef(new Animated.Value(30)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  // Floating shapes animations
  const shape1TranslateY = useRef(new Animated.Value(0)).current;
  const shape1Opacity = useRef(new Animated.Value(0.3)).current;
  const shape1Rotation = useRef(new Animated.Value(0)).current;

  const shape2TranslateY = useRef(new Animated.Value(0)).current;
  const shape2Opacity = useRef(new Animated.Value(0.3)).current;
  const shape2Rotation = useRef(new Animated.Value(0)).current;

  const shape3TranslateY = useRef(new Animated.Value(0)).current;
  const shape3Opacity = useRef(new Animated.Value(0.3)).current;
  const shape3Rotation = useRef(new Animated.Value(0)).current;

  const shape4TranslateY = useRef(new Animated.Value(0)).current;
  const shape4Opacity = useRef(new Animated.Value(0.3)).current;
  const shape4Rotation = useRef(new Animated.Value(0)).current;

  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        await startAnimations();

        // small delay so splash is visible for ~3.5s
        await new Promise(resolve => setTimeout(resolve, 3500));

        if (!isLoading) {
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
        console.error('Error in auth check:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: 'AuthScreen' as never }],
        });
      }
    };

    checkAuthAndNavigate();
  }, [isLoading, isAuthenticated]);

  const startAnimations = () => {
    // Logo animation
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous logo rotation
    Animated.loop(
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();

    // App name animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(appNameTranslateY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(appNameOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    // Welcome message animation
    setTimeout(() => {
      Animated.parallel([
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
      ]).start();
    }, 800);

    // Tagline animation
    setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1200);

    // Loading animation
    setTimeout(() => {
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Progress bar animation
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start();
    }, 1500);

    // Floating shapes animations
    startFloatingAnimation(shape1TranslateY, shape1Opacity, shape1Rotation, 2000, 0);
    startFloatingAnimation(shape2TranslateY, shape2Opacity, shape2Rotation, 2500, 500);
    startFloatingAnimation(shape3TranslateY, shape3Opacity, shape3Rotation, 3000, 1000);
    startFloatingAnimation(shape4TranslateY, shape4Opacity, shape4Rotation, 2200, 750);
  };

  const startFloatingAnimation = (
    translateY: Animated.Value,
    opacity: Animated.Value,
    rotation: Animated.Value,
    duration: number,
    delay: number
  ) => {
    setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -50,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(rotation, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
  };

  const logoRotationInterpolate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shape1RotationInterpolate = shape1Rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shape2RotationInterpolate = shape2Rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shape3RotationInterpolate = shape3Rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shape4RotationInterpolate = shape4Rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidthInterpolate = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#667eea', '#667eea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Floating Background Shapes */}
        <Animated.View
          style={[
            styles.floatingShape,
            styles.shape1,
            {
              transform: [
                { translateY: shape1TranslateY },
                { rotate: shape1RotationInterpolate },
              ],
              opacity: shape1Opacity,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.floatingShape,
            styles.shape2,
            {
              transform: [
                { translateY: shape2TranslateY },
                { rotate: shape2RotationInterpolate },
              ],
              opacity: shape2Opacity,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.floatingShape,
            styles.shape3,
            {
              transform: [
                { translateY: shape3TranslateY },
                { rotate: shape3RotationInterpolate },
              ],
              opacity: shape3Opacity,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.floatingShape,
            styles.shape4,
            {
              transform: [
                { translateY: shape4TranslateY },
                { rotate: shape4RotationInterpolate },
              ],
              opacity: shape4Opacity,
            },
          ]}
        />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: logoScale },
                  { rotate: logoRotationInterpolate },
                ],
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
      </LinearGradient>
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
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 20,
  },
  logoIcon: {
    fontSize: 48,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  welcomeMessage: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '400',
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
    marginBottom: 60,
    textAlign: 'center',
    fontWeight: '300',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    fontWeight: '500',
  },
  progressBarContainer: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  floatingShape: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  shape1: {
    width: 80,
    height: 80,
    top: height * 0.15,
    left: width * 0.1,
  },
  shape2: {
    width: 120,
    height: 120,
    bottom: height * 0.25,
    right: width * 0.15,
  },
  shape3: {
    width: 60,
    height: 60,
    bottom: height * 0.37,
    left: width * 0.2,
  },
  shape4: {
    width: 100,
    height: 100,
    top: height * 0.1,
    right: width * 0.25,
  },
});
