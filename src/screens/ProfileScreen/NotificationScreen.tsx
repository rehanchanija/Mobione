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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { Notification } from "../../services/api";
import { THEME } from "../../theme";

const NotificationScreen = () => {
  const navigation = useNavigation();

  const {
    useNotifications,
    useUnreadCount,
    markNotificationAsReadMutation,
    markAllAsReadMutation,
    deleteNotificationMutation,
    deleteAllNotificationsMutation,
  } = useAuth();

  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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
  const deleteAllNotificationsMutation_mut = deleteAllNotificationsMutation();

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
    setMenuVisible(false);
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

  const handleClearAll = () => {
    setMenuVisible(false);
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to delete all notifications?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllNotificationsMutation_mut.mutateAsync();
              setAllNotifications([]);
              Alert.alert("Success", "All notifications cleared");
            } catch {
              Alert.alert("Error", "Failed to clear notifications");
            }
          },
        },
      ]
    );
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
      style={[styles.card, !item.read && { backgroundColor: THEME.colors.infoLight }]}
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
      >
        <Text style={{ fontSize: 20,  color: THEME.colors.textTertiary, fontWeight: "bold" }}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoadingNotifications && page === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </SafeAreaView>
    );
  }

  if (notificationsError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", color: THEME.colors.error }}>
          Error loading notifications
        </Text>
        <TouchableOpacity
          onPress={handleRefresh}
          style={{
            backgroundColor: THEME.colors.primary,
            padding: 10,
            borderRadius: THEME.spacing.borderRadius.md,
            marginTop: 10,
            alignSelf: "center",
          }}
        >
          <Text style={{ color: THEME.colors.white }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Custom header with dropdown menu */}
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
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={[
                styles.menuItem,
                (!unreadData || unreadData.unreadCount === 0) && styles.menuItemDisabled
              ]}
              onPress={handleMarkAllAsRead}
              disabled={!unreadData || unreadData.unreadCount === 0}
            >
              <Text style={[
                styles.menuItemIcon,
                (!unreadData || unreadData.unreadCount === 0) && styles.menuItemTextDisabled
              ]}>✓</Text>
              <Text style={[
                styles.menuItemText,
                (!unreadData || unreadData.unreadCount === 0) && styles.menuItemTextDisabled
              ]}>Mark all as read</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderTopWidth: 1, borderTopColor: THEME.colors.border },
                allNotifications.length === 0 && styles.menuItemDisabled
              ]}
              onPress={handleClearAll}
              disabled={allNotifications.length === 0}
            >
              <Text style={[
                styles.menuItemIcon,
                { color: allNotifications.length > 0 ? THEME.colors.error : THEME.colors.textTertiary }
              ]}>🗑</Text>
              <Text style={[
                styles.menuItemText,
                { color: allNotifications.length > 0 ? THEME.colors.error : THEME.colors.textTertiary }
              ]}>Clear all</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
            colors={[THEME.colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ padding: 10 }}>
              <ActivityIndicator size="small" color={THEME.colors.primary} />
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
    backgroundColor: THEME.colors.backgroundAlt,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.xl,
  },
  card: {
    flexDirection: "row",
    backgroundColor: THEME.colors.white,
    marginHorizontal: THEME.spacing.xs,
    padding: THEME.spacing.sm,
    borderRadius: THEME.spacing.borderRadius.xl,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  emoji: {
    fontSize: 28,
    marginRight: THEME.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
  },
  message: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.textSecondary,
    marginVertical: THEME.spacing.xs,
  },
  time: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.textTertiary,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: THEME.spacing["xl"],
    paddingVertical: THEME.spacing.xl,
    backgroundColor: THEME.colors.white,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.xl,
    borderRadius: THEME.spacing.borderRadius.xl,
    ...THEME.shadows.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: THEME.spacing.borderRadius.md,
    backgroundColor: THEME.colors.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 24,
    color: THEME.colors.gray700,
    fontWeight: "bold",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: THEME.typography.fontSizes["2xl"],
    fontWeight: "600",
    color: THEME.colors.textPrimary,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 24,
    color: THEME.colors.gray700,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.spacing.borderRadius.lg,
    minWidth: 200,
    ...THEME.shadows.lg,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: THEME.spacing.lg,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: THEME.spacing.md,
    color: THEME.colors.textPrimary,
  },
  menuItemText: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemTextDisabled: {
    color: THEME.colors.textTertiary,
  },
});