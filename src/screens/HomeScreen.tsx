import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import React, { use, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, RootTabParamList } from "../navigation/types";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { useDashboardTotals, useTotalStock, useNotifications, useTotalBillsCount } = useAuth();
  const { data: totals, isLoading } = useDashboardTotals();
  const { data: stockData, isLoading: stockLoading } = useTotalStock();
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications(1, 5);
  const { data: billsCountData, isLoading: billsCountLoading } = useTotalBillsCount();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (notificationsData?.notifications) {
      setNotifications(notificationsData.notifications);
    }
  }, [notificationsData]);

  const getNotificationEmoji = (type: string) => {
    switch (type) {
      case 'BILL_CREATED':
        return '🧾';
      case 'BILL_UPDATED':
        return '📝';
      case 'LOW_STOCK':
        return '⚠️';
      case 'PRODUCT_CREATED':
      case 'PRODUCT_UPDATED':
        return '📦';
      case 'PRODUCT_DELETED':
        return '🗑️';
      default:
        return '📌';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActivityText = (notification: any) => {
    const { type, message, data } = notification;

    if (type === 'BILL_CREATED') {
      const billNumber = data?.billNumber || 'Unknown';
      const lastFourDigits = billNumber.toString().slice(-4);
      const customerName = data?.customerName || 'Customer';
      return `Sold #${lastFourDigits} - ${customerName}`;
    } else if (type === 'BILL_UPDATED') {
      const billNumber = data?.billNumber || 'Unknown';
      const lastFourDigits = billNumber.toString().slice(-4);
      const customerName = data?.customerName || 'Customer';
      return `Updated Sale #${lastFourDigits} - ${customerName}`;
    } else if (type === 'LOW_STOCK') {
      const productName = data?.productName || 'Product';
      const stock = data?.stock || '0';
      return `Low Stock: ${productName} (${stock} units)`;
    } else if (type === 'PRODUCT_CREATED') {
      const productName = data?.productName || data?.name || message;
      return `Stock create: ${productName}`;
    } else if (type === 'PRODUCT_UPDATED') {
      const productName = data?.productName || data?.name || message;
      return `Stock update: ${productName}`;
    }
    return message;
  };

  const getActivityAmount = (notification: any) => {
    const { type, data } = notification;

    if (type === 'BILL_CREATED' || type === 'BILL_UPDATED') {
      const amount = data?.totalAmount || 0;
      return `₹ ${amount.toLocaleString('en-IN')}`;
    } else if (type === 'LOW_STOCK') {
      const stock = data?.stock || '0';
      return `${stock} units`;
    } else if (type === 'PRODUCT_UPDATED' || type === 'PRODUCT_CREATED') {
      const quantity = data?.stock || data?.quantity || '';
      if (type === 'PRODUCT_UPDATED' && quantity) {
        return `${quantity} units`;
      }
      return quantity ? `+${quantity}` : '';
    }
    return '';
  };

  return (
    <View style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>📌 Overview</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Sales (All Time)</Text>
            <Text style={styles.cardValue}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#4A90E2" />
              ) : (
                `₹ ${(totals?.totalSalesAllTime || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              )}
            </Text>
            <Text style={styles.emoji}>💰</Text>
          </View>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.cardLabel}>Total Stock</Text>
            <Text style={styles.cardValue}>
              {stockLoading ? (
                <ActivityIndicator size="small" color="#4A90E2" />
              ) : (
                `${stockData?.totalStock || 0} Units`
              )}
            </Text>
            <Text style={styles.emoji}>📦</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('Bills',  {
                screen: 'BillHistory',
                params: { filterPending: true },
              })
            }
          >
            <Text style={styles.cardLabel}>Pending Payments (All Time)</Text>
            <Text style={styles.cardValue}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#4A90E2" />
              ) : (
                `₹ ${(totals?.totalPendingAmountAllTime || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              )}
            </Text>
            <Text style={styles.emoji}>⏳</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('Bills', {
                screen: 'BillHistory',
                params: { filterPending: false },
              })
            }
          >
            <Text style={styles.cardLabel}>Total Bills</Text>
            <Text style={styles.cardValue}>
              {billsCountLoading ? (
                <ActivityIndicator size="small" color="#4A90E2" />
              ) : (
                `${billsCountData?.totalBills || 0} Orders`
              )}
            </Text>
            <Text style={styles.emoji}>🛒</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.quickCard, styles.quickPrimary] }
          onPress={() => navigation.navigate('Billing' as never)}>
            <Text style={styles.quickEmoji}>✚</Text>
            <Text style={styles.quickTextPrimary}>New Bill</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} 
            onPress={() => navigation.navigate('Products')}
>
          
            <Text style={styles.quickEmoji}>🏷️</Text>
            <Text style={styles.quickText}>View Products</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>🕒 Recent Activity</Text>
        {notificationsLoading ? (
          <ActivityIndicator size="large" color="#4A90E2" style={{ marginVertical: 20 }} />
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <View key={notification._id} style={styles.activityItem}>
              <Text style={styles.emoji}>{getNotificationEmoji(notification.type)}</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{getActivityText(notification)}</Text>
              </View>
              <View style={styles.activityRightContent}>
                <Text style={styles.activityTime}>{formatDate(notification.createdAt)}</Text>
                <Text style={styles.activityAmount}>{getActivityAmount(notification)}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.activityItem}>
            <Text style={styles.emoji}>📭</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>No notifications yet</Text>
              <Text style={styles.activityTime}>Check back later</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    paddingHorizontal: 20,
    paddingTop: 30, // 🔹 More top spacing
  },
  scrollContent: {
    paddingBottom: 30, // 🔹 Extra bottom space so last item isn’t cramped
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25, // 🔹 More spacing below header
  },
  headerTitle: {
    fontSize: 22, // 🔹 Slightly bigger font
    fontWeight: "700",
    color: "#111",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 24, // 🔹 Bigger font
    fontWeight: "600",
    color: "#333",
    marginVertical: 15, // 🔹 Extra vertical spacing
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20, // 🔹 More space below grid
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    width: "48%",
    marginBottom: 15,
    elevation: 3,
    alignItems: "flex-start",
  },
  cardLabel: {
    fontSize: 14,
    color: "#666",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 6,
    color: "#111",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20, // 🔹 More space under quick actions
  },
  quickCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    width: "48%",
    alignItems: "center",
    elevation: 3,
  },
  quickPrimary: {
    backgroundColor: "#4A90E2"
  },
  quickText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#4A90E2",
  },
  quickTextPrimary: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  quickEmoji: {
    fontSize: 32,
    color: "#eeefeefe",
  },
  emoji: {
    fontSize: 22,
     // 🔹 Slightly bigger emojis
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12, // 🔹 More space between activities
    elevation: 2,
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityRightContent: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  activityText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
  },
  activityTime: {
    fontSize: 13,
    color: "#777",
  },
  activityAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4A90E2",
  },
});
