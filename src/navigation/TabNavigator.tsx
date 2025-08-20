import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import HomeScreen from "../screens/HomeScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: string = "home";

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Cart") iconName = "cart";
          else if (route.name === "Profile") iconName = "person";

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cart" component={() => <Text>Cart</Text>} />
      <Tab.Screen name="Profile" component={() => <Text>Profile</Text>} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
