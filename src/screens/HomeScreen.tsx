import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Dashboard</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Text style={styles.emoji}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 15 }}>
            <Text style={styles.emoji}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Overview */}
        <Text style={styles.sectionTitle}>📌 Overview</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Today's Sales</Text>
            <Text style={styles.cardValue}>₹ 12,345</Text>
            <Text style={styles.emoji}>💰</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Stock</Text>
            <Text style={styles.cardValue}>875 Items</Text>
            <Text style={styles.emoji}>📦</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Pending Payments</Text>
            <Text style={styles.cardValue}>₹ 3,210</Text>
            <Text style={styles.emoji}>⏳</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Recent Orders</Text>
            <Text style={styles.cardValue}>15 Orders</Text>
            <Text style={styles.emoji}>🛒</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.quickCard, styles.quickPrimary]}>
            <Text style={styles.quickEmoji}>➕</Text>
            <Text style={styles.quickTextPrimary}>New Bill</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard}>
            <Text style={styles.quickEmoji}>🏷️</Text>
            <Text style={styles.quickText}>View Products</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>🕒 Recent Activity</Text>
        <View style={styles.activityItem}>
          <Text style={styles.emoji}>🧾</Text>
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>Sale #10234 to Mr. Sharma</Text>
            <Text style={styles.activityTime}>10:30 AM</Text>
          </View>
          <Text style={styles.activityAmount}>₹ 1,500</Text>
        </View>

        <View style={styles.activityItem}>
          <Text style={styles.emoji}>📦</Text>
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>Stock Update: Laptops</Text>
            <Text style={styles.activityTime}>09:15 AM</Text>
          </View>
          <Text style={styles.activityAmount}>+5 Units</Text>
        </View>

        <View style={styles.activityItem}>
          <Text style={styles.emoji}>💵</Text>
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>
              Payment Received from Mrs. Kaur
            </Text>
            <Text style={styles.activityTime}>09:45 AM</Text>
          </View>
          <Text style={styles.activityAmount}>₹ 800</Text>
        </View>

        <View style={styles.activityItem}>
          <Text style={styles.emoji}>🧾</Text>
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>Sale #10233 to Mr. Kumar</Text>
            <Text style={styles.activityTime}>Yesterday</Text>
          </View>
          <Text style={styles.activityAmount}>₹ 2,200</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    paddingHorizontal: 20,
    paddingTop: 50, // 🔹 More top spacing
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
    fontSize: 18, // 🔹 Bigger font
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
    padding: 22,
    width: "48%",
    alignItems: "center",
    elevation: 3,
  },
  quickPrimary: {
    backgroundColor: "#4A90E2",
  },
  quickText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#4A90E2",
  },
  quickTextPrimary: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  quickEmoji: {
    fontSize: 32, // 🔹 Bigger quick action emoji
  },
  emoji: {
    fontSize: 22, // 🔹 Slightly bigger emojis
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
