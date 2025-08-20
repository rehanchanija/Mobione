import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';


type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

type Props = { navigation: SplashScreenNavigationProp };

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('MainTabs'); // Navigate to TabNavigator
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.appName}>📱 My Phone Store</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { width: 120, height: 120, marginBottom: 20 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#007AFF' },
});

export default SplashScreen;
