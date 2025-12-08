import React, { useEffect, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "./types";
import HomeScreen from "../screens/HomeScreen";
import { Alert, Text, View, TouchableOpacity, Platform, StatusBar, StyleSheet, Animated } from "react-native";
import BillingStack from "./BillingStack";
import BillsStack from "./BillsStack";
import { useNavigation } from "@react-navigation/native";
import ProductsStack from "./ProductsStack";
import { useAuth } from "../hooks/useAuth";
import { THEME } from "../theme";

const Tab = createBottomTabNavigator<RootTabParamList>();

const getEmojiIcon = (route: keyof RootTabParamList) => {
  switch (route) {
    case "Home":
      return "🏠";
    case "Products":
      return "🛍️";
    case "Billing":
      return "🧾";
    case "Bills":
      return "📑";
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
    case "Bills":
      return "📑 Sales Analytics";
  
    default:
      return "❓ Screen";
  }
};

// Animated Bell Component
const AnimatedBell = ({ unreadCount }: { unreadCount: number }) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const prevUnreadRef = useRef(0);
  const runningRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const prev = prevUnreadRef.current;

    // If unread decreases to 0 → stop and reset
    if (unreadCount === 0) {
      runningRef.current?.stop?.();
      shakeAnim.setValue(0);
      prevUnreadRef.current = unreadCount;
      return;
    }

    // Only perform a single shake when unread count changes (e.g., new notification)
    if (unreadCount > 0 && unreadCount !== prev) {
      runningRef.current?.stop?.();
      const shakeOnce = Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]);
      runningRef.current = shakeOnce;
      shakeOnce.start(() => {
        runningRef.current = null;
      });
    }

    prevUnreadRef.current = unreadCount;
  }, [unreadCount, shakeAnim]);

  const rotation = shakeAnim.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-15deg', '15deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ rotate: rotation }],
        position: 'relative',
      }}
    >
      <Text style={{ fontSize: 30, marginRight: 18 }}>🔔</Text>
      {unreadCount > 0 && (
        <View style={styles.badge} />
      )}
    </Animated.View>
  );
};

const TabNavigator = () => {
  const navigation = useNavigation();
  const { useUnreadCount } = useAuth();
  const { data: unreadData } = useUnreadCount();
  
  const unreadCount = unreadData?.unreadCount || 0;
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitle: getHeaderTitle(route.name),
        headerTitleStyle: {
          fontSize: THEME.typography.fontSizes["2xl"],
          fontWeight: "700",
          color: THEME.colors.textPrimary,
        },
        headerStyle: {
          backgroundColor: THEME.colors.white,
          height: 110,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 20 : 25,
          paddingBottom: THEME.spacing.lg,
          paddingHorizontal: THEME.spacing.xl,
          borderBottomWidth: 1,
          borderBottomColor: THEME.colors.border,
          ...THEME.shadows.md,
        },
        headerRight: () => (
          <View style={{ flexDirection: "row", marginRight: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notification" as never)}
              style={{ position: "relative" }}
            >
              <AnimatedBell unreadCount={unreadCount} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile" as never)}
            >
              <Text style={{ fontSize: 32 }}>👤</Text>
            </TouchableOpacity>
          </View>
        ),
        tabBarIcon: () => (
          <Text style={{ fontSize: 22 }}>{getEmojiIcon(route.name)}</Text>
        ),
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.gray400,
        tabBarStyle: {
          backgroundColor: THEME.colors.white,
          borderTopWidth: 1,
          borderTopColor: THEME.colors.border,
          elevation: 2,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: THEME.typography.fontSizes.sm,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsStack} />
      <Tab.Screen name="Billing" component={BillingStack} />
      <Tab.Screen name="Bills" component={BillsStack} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: 4,
    right: 20,
    backgroundColor: THEME.colors.notification,
    borderRadius: 8,
    width: 16,
    height: 14,
    borderWidth: 2,
    borderColor: THEME.colors.white,
  },
});

export default TabNavigator;
