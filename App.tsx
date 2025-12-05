import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SplashScreen from './src/screens/SplashScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { RootStackParamList } from './src/navigation/types';
import ProfileStack from './src/navigation/ProfileStack';
import AuthScreen from './src/screens/AuthScreen';
import NotificationScreen from './src/screens/ProfileScreen/NotificationScreen';
import Dashboard from './src/navigation/DashboardStack';
import FlashMessage from "react-native-flash-message";


const queryClient = new QueryClient();

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen 
              name="AuthScreen" 
              component={AuthScreen}
              options={{
                gestureEnabled: false,
              }} 
            />
         
            <Stack.Screen 
              name="MainTabs" 
              component={TabNavigator}
              options={{
                gestureEnabled: false,
              }} 
            />
            <Stack.Screen name="Profile" component={ProfileStack} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="HomeScreen" component={Dashboard} />
          </Stack.Navigator>

        </NavigationContainer>
                <FlashMessage position="top" style={{ margin: 20,marginTop:80 ,borderRadius:10, }} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
