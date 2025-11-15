import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { Notification } from "../../services/api";

const NotificationScreen = () => {
  const navigation = useNavigation();

  const {
    useNotifications,
    useUnreadCount,
    markNotificationAsReadMutation,
    markAllAsReadMutation,
    deleteNotificationMutation,
  } = useAuth();

  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // API hooks
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useNotifications(page, 10);

  const { data: unreadData } = useUnreadCount();
  const markAsReadMutation = markNotificationAsReadMutation();
  const markAllAsReadMutation_mut = markAllAsReadMutation();
  const deleteNotificationMutation_mut = deleteNotificationMutation();

  useEffect(() => {
    if (notificationsData?.notifications) {
      if (page === 1) {
        setAllNotifications(notificationsData.notifications);
      } else {
        const existingIds = new Set(allNotifications.map((n) => n._id));
        const newNotifications = notificationsData.notifications.filter(
          (n) => !existingIds.has(n._id)
        );
        setAllNotifications([...allNotifications, ...newNotifications]);
      }
      setIsLoadingMore(false);
    }
  }, [notificationsData]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      setAllNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch {
      Alert.alert("Error", "Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation_mut.mutateAsync();
      setAllNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      Alert.alert("Error", "Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotificationMutation_mut.mutateAsync(notificationId);
      setAllNotifications((prev) =>
        prev.filter((n) => n._id !== notificationId)
      );
    } catch {
      Alert.alert("Error", "Failed to delete notification");
    }
  };

  const handleLoadMore = () => {
    if (
      !isLoadingMore &&
      notificationsData &&
      page < (notificationsData.totalPages || 1)
    ) {
      setIsLoadingMore(true);
      setPage(page + 1);
    }
  };

   const handleRefresh = () => {
    setPage(1);
    refetchNotifications();
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.card, !item.read && { backgroundColor: "#eef4ff" }]}
      onPress={() => handleMarkAsRead(item._id)}
    >
      <Text style={styles.emoji}>
        {item.type === "BILL_CREATED"
          ? "📄"
          : item.type === "PRODUCT_CREATED"
          ? "📦"
          : item.type === "PAYMENT_PENDING"
          ? "💰"
          : item.type === "BRAND_CREATED"
          ? "🏷️"
          : item.type === "LOW_STOCK"
          ? "⚠️"
          : "🔔"}
      </Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item._id)}
        style={{ marginLeft: 10 }}
      >
        <Text style={{ fontSize: 16, color: "#999" }}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoadingNotifications && page === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </SafeAreaView>
    );
  }

  if (notificationsError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", color: "red" }}>
          Error loading notifications
        </Text>
        <TouchableOpacity
          onPress={handleRefresh}
          style={{
            backgroundColor: "#2196F3",
            padding: 10,
            borderRadius: 8,
            marginTop: 10,
            alignSelf: "center",
          }}
        >
          <Text style={{ color: "#fff" }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Custom header same as your original */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notification</Text>
        </View>
        {unreadData && unreadData.unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={{ color: "#2196F3", fontWeight: "600" }}>Mark all</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={allNotifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingNotifications && page === 1}
            onRefresh={handleRefresh}
            colors={["#2196F3"]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ padding: 10 }}>
              <ActivityIndicator size="small" color="#2196F3" />
            </View>
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", marginTop: 100 }}>
            <Text style={{ fontSize: 60 }}>🔔</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#555" }}>
              No Notifications
            </Text>
            <Text style={{ color: "#777" }}>
              You're all caught up! Check back later.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  message: {
    fontSize: 14,
    color: "#4B5563",
    marginVertical: 4,
  },
  time: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: "#fff",
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 15,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f3f4f6b2",
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 24,
    color: "#374151",
    fontWeight: "bold",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
});
