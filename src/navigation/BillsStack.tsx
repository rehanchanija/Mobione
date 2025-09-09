import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SalesAnalyticsScreen from '../screens/SalesAnalyticsScreen';
import SalesDetailScreen from '../screens/SalesDetailScreen';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const BillsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SalesAnalytics" component={SalesAnalyticsScreen} />
      <Stack.Screen name="SalesDetail" component={SalesDetailScreen} />
    </Stack.Navigator>
  );
};

export default BillsStack;