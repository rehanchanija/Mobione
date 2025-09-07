import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { BillingStackParamList } from "../navigation/BillingStack";

type BillingNavProp = NativeStackNavigationProp<BillingStackParamList, "Billing">;

export default function BillingScreen() {
  const navigation = useNavigation<BillingNavProp>();
  const [filter, setFilter] = useState<"All" | "Paid" | "Pending">("All");

  const orders = [
    { id: "#1001", name: "Ravi Kumar", items: 3, total: 500, status: "Paid" },
    { id: "#1002", name: "Priya Sharma", items: 2, total: 250, status: "Pending" },
    { id: "#1003", name: "Amit Singh", items: 5, total: 780.5, status: "Paid" },
    { id: "#1004", name: "Neha Gupta", items: 1, total: 120, status: "Paid" },
    { id: "#1005", name: "Vijay Mehta", items: 4, total: 610, status: "Pending" },
    { id: "#1006", name: "Kirti Reddy", items: 2, total: 340, status: "Paid" },
  ];

  const filteredOrders =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>


      {/* Start New Bill */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Start New Bill</Text>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>📷 Scan Barcode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>🛒 Select Products</Text>
        </TouchableOpacity>
      </View>

      {/* Current Bill */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Bill</Text>

        <View style={styles.billItem}>
          <Text>☕ Espresso Blend Coffee {"\n"}2 x ₹150</Text>
          <Text>₹300.00</Text>
        </View>
        <View style={styles.billItem}>
          <Text>🥐 Artisan Croissant {"\n"}1 x ₹80</Text>
          <Text>₹80.00</Text>
        </View>
        <View style={styles.billItem}>
          <Text>🍊 Fresh Orange Juice {"\n"}1 x ₹120</Text>
          <Text>₹120.00</Text>
        </View>

        <View style={styles.billTotal}>
          <Text style={{ fontWeight: "600" }}>Subtotal:</Text>
          <Text style={{ fontWeight: "600" }}>₹500.00</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { marginTop: 15 }]}
          onPress={() => navigation.navigate("BillDetails")}
        >
          <Text style={styles.primaryBtnText}>💳 Proceed to Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Orders */}
      <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Recent Orders</Text>
      <View style={styles.filterRow}>
        {["All", "Paid", "Pending"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filter === f && styles.filterBtnActive,
            ]}
            onPress={() => setFilter(f as "All" | "Paid" | "Pending")}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === f && { color: "#fff" },
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredOrders.map((order, index) => (
        <TouchableOpacity
          key={order.id}
          style={[
            styles.orderItem,
            index === filteredOrders.length - 1 && { borderBottomWidth: 0 },
          ]}
        >
          <View>
            <Text style={styles.orderName}>{order.name}</Text>
            <Text style={styles.orderDetails}>
              Bill {order.id} • {order.items} items
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.orderTotal}>₹{order.total}</Text>
            <Text
              style={{
                color: order.status === "Paid" ? "green" : "orange",
                fontWeight: "600",
              }}
            >
              {order.status}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  icon: { fontSize: 20, marginLeft: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    elevation: 2,
    shadowOpacity: 0.1,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  primaryBtn: {
    backgroundColor: "#0066FF",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
  secondaryBtn: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#333", fontWeight: "600" },
  billItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8, // more spacing between items
  },
  billTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 5,
  },
  filterBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 12,
  },
  filterBtnActive: { backgroundColor: "#0066FF", borderColor: "#0066FF" },
  filterBtnText: { fontWeight: "600", color: "#333" },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 8,
  },
  orderName: { fontWeight: "600", fontSize: 15, marginBottom: 3 },
  orderDetails: { fontSize: 13, color: "#777" },
  orderTotal: { fontWeight: "700", fontSize: 15 },
});
