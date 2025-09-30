import { useNavigation, useRoute } from "@react-navigation/native";
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

type BillingNavProp = any;

export default function BillingScreen() {
  const navigation = useNavigation<BillingNavProp>();
  const route = useRoute<any>();
  const initialItems = (route.params?.items as { productId: string; name: string; unitPrice: number; quantity: number }[]) || [];
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<"All" | "Paid" | "Pending">("All");

  const orders: any[] = [];

  const filteredOrders =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
     
      

      {/* Start New Bill */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🚀 Start New Bill</Text>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>📷 Scan Barcode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate("Product" as never, { allProducts: true } as never)}>
          <Text style={styles.secondaryBtnText}>🛒 Select Products</Text>
        </TouchableOpacity>
      </View>

      {/* Current Bill */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🧮 Current Bill</Text>

        {items.length === 0 ? (
          <Text style={{ color: "#6b7280" }}>No items selected yet.</Text>
        ) : (
          <>
            {items.map((it, idx) => (
              <View style={styles.billItem} key={`${it.productId}-${idx}`}>
                <Text style={styles.billText}>
                  {it.name} {"\n"}
                  {it.quantity} x ₹{it.unitPrice}
                </Text>
                <Text style={styles.billAmount}>₹{(it.unitPrice * it.quantity).toFixed(2)}</Text>
              </View>
            ))}

            <View style={styles.billTotal}>
              <Text style={styles.billTotalText}>Subtotal</Text>
              <Text style={styles.billTotalText}>₹{items.reduce((s, it) => s + it.unitPrice * it.quantity, 0).toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 15 }]}
              onPress={() => navigation.navigate("BillDetails", { items })}
            >
              <Text style={styles.primaryBtnText}>💳 Proceed to Payment</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Recent Orders */}
      <Text style={[styles.sectionTitle, { marginTop: 5 }]}>📋 Recent Orders</Text>
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
            <Text style={styles.orderName}>👤 {order.name}</Text>
            <Text style={styles.orderDetails}>
              🧾 Bill {order.id} • {order.items} items
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.orderTotal}>₹{order.total}</Text>
            <Text
              style={[
                styles.orderStatus,
                {
                  color: order.status === "Paid" ? "#16a34a" : "#f59e0b",
                },
              ]}
            >
              {order.status}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 15 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: "700" }, // bigger font
  icon: { fontSize: 26 },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  primaryBtn: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  secondaryBtn: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#333", fontWeight: "700", fontSize: 18 },
  billItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  billText: { fontSize: 16 },
  billAmount: { fontWeight: "600", fontSize: 16 },
  billTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingTop: 8,
  },
  billTotalText: { fontWeight: "700", fontSize: 17 },
  filterRow: {
    flexDirection: "row",
    marginBottom: 15,
    marginTop: 5,
  },
  filterBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
  },
  filterBtnActive: { backgroundColor: "#4A90E2", borderColor: "#0066FF" },
  filterBtnText: { fontWeight: "600", color: "#333", fontSize: 15 },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
  },
  orderName: { fontWeight: "700", fontSize: 16, marginBottom: 2 },
  orderDetails: { fontSize: 14, color: "#6b7280" },
  orderTotal: { fontWeight: "700", fontSize: 16 },
  orderStatus: { fontWeight: "600", fontSize: 14, marginTop: 3 },
});
