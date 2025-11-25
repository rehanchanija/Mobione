import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import BillHistoryScreen from '../screens/BillHistoryScreen';
import BillsInvoice from '../screens/BillsInvoice';

const Stack = createStackNavigator<RootStackParamList>();

const BillsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="BillHistory" component={BillHistoryScreen} />
      <Stack.Screen name="BillInvoice" component={BillsInvoice} />

    </Stack.Navigator>
  );
};

export default BillsStack;