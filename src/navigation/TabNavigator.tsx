import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "./types";
import HomeScreen from "../screens/HomeScreen";
import { Alert, Text, View, TouchableOpacity, Platform, StatusBar } from "react-native";
import ProductsStack from "./ProductsStack";
import BillingStack from "./BillingStack";
import ReportsScreen from "../screens/ReportsScreen";

const Tab = createBottomTabNavigator<RootTabParamList>();

const getEmojiIcon = (route: keyof RootTabParamList) => {
  switch (route) {
    case "Home":
      return "🏠";
    case "Products":
      return "🛍️";
    case "Billing":
      return "🧾";
    case "Reports":
      return "📊";
    case "Settings":
      return "⚙️";
    default:
      return "❓";
  }
};

const getHeaderTitle = (route: keyof RootTabParamList) => {
  switch (route) {
    case "Home":
      return "📊 Dashboard";
    case "Products":
      return "🛍️ Products";
    case "Billing":
      return "🧾  Create Bill";
    case "Reports":
      return "📑 Reports";
    case "Settings":
      return "⚙️ Settings";
    default:
      return "❓ Screen";
  }
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitle: getHeaderTitle(route.name),
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: "700",
        },
        headerStyle: {
          backgroundColor: "#fff",
          height: 110, // overall header height
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 20 : 25, // space from top
          paddingBottom: 15, // ✅ extra bottom space
          paddingHorizontal: 20, // ✅ space on sides
        },
        headerRight: () => (
          <View style={{ flexDirection: "row", marginRight: 10 }}>
            <TouchableOpacity
              onPress={() => Alert.alert("Notifications will open")}
            >
              <Text style={{ fontSize: 30, marginRight: 18 }}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert("Profile screen will open")}
            >
              <Text style={{ fontSize: 32 }}>👤</Text>
            </TouchableOpacity>
          </View>
        ),
        tabBarIcon: () => (
          <Text style={{ fontSize: 22 }}>{getEmojiIcon(route.name)}</Text>
        ),
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsStack} />
      <Tab.Screen name="Billing" component={BillingStack} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
