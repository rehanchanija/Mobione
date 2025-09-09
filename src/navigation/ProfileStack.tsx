import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import ProfileScreen from "../screens/ProfileScreen";

export type RootStackParamList = {
  Tabs: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tabs as the main bottom navigation */}
      <Stack.Screen name="Tabs" component={TabNavigator} />
      
      {/* Profile screen (will open on top of tabs) */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
