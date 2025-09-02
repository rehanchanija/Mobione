import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "./types";
import HomeScreen from "../screens/HomeScreen";
import ProductsScreen from "../screens/ProductsScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ReportsScreen from "../screens/ReportsScreen";
// import SettingsScreen from "../screens/SettingsScreen";
import { Alert, Text } from "react-native";

const Tab = createBottomTabNavigator<RootTabParamList>();

const getEmojiIcon = (route: keyof RootTabParamList) => {
  switch (route) {
    case "Home":
      return "🏠"; // Home
    case "Products":
      return "🛍️"; // Shopping bags
    case "Orders":
      return "📑"; // Invoice / Orders
    case "Reports":
      return "📊"; // Chart / Reports
    case "Settings":
      return "⚙️"; // Settings
    default:
      return "❓";
  }
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerRight: () => (
          <Text
            style={{ fontSize: 28, marginRight: 15 }}
            onPress={() => Alert.alert("Profile screen will open here")}
          >
            👤
          </Text>
        ),
        tabBarIcon: () => (
          <Text style={{ fontSize: 20 }}>{getEmojiIcon(route.name)}</Text>
        ),
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} 
        options={{ headerShown: false }} // hides default navigation header

      />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      {/* <Tab.Screen name="Settings" component={SettingsScreen} /> */}
    </Tab.Navigator>
  );
};

export default TabNavigator;
