import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from '../hooks/useAuth';

type BillingNavProp = any;

interface Bill {
  _id: string;
  billNumber: string;
  total: number;
  amountPaid: number;
  createdAt: string;
  items: any[];
}

export default function BillingScreen() {
  const navigation = useNavigation<BillingNavProp>();
  const route = useRoute<any>();
  const initialItems = (route.params?.items as { productId: string; name: string; unitPrice: number; quantity: number }[]) || [];
  const [items, setItems] = useState(initialItems);
  
  // Use bills API from useAuth with pagination (first page, 5 items)
  const { useBills } = useAuth();
  const { data: billsResponse, isLoading } = useBills(1, 5);
  console.log("Fetched bills response:", billsResponse);

  // Get recent bills from paginated response
  const recentBills = billsResponse?.bills || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Start New Bill */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🚀 Start New Bill</Text>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>📷 Scan Barcode</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.secondaryBtn} 
          onPress={() => navigation.navigate("Product", { allProducts: true, selectForBill: true })}>
          <Text style={styles.secondaryBtnText}>🛒 Select Products</Text>
        </TouchableOpacity>
      </View>
<View style={styles.card}>
        <Text style={styles.sectionTitle}>🧮 Current Bill</Text>

        {items.length === 0 ? (
          <Text style={{ color: "#6b7280" }}>No items selected yet.</Text>
        ) : (
          <>
            {items.map((it, idx) => (
              <View style={styles.currentBillItem} key={`${it.productId}-${idx}`}>
                <Text style={styles.billText}>
                  {it.name} {"\n"}
                  {it.quantity} x ₹{it.unitPrice}
                </Text>
                <Text style={styles.currentBillAmount}>₹{(it.unitPrice * it.quantity).toFixed(2)}</Text>
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
              <Text style={styles.primaryBtnText}>💳 Proceed to Bill</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      {/* Recent Orders */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📋 Recent Orders</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#4A90E2" />
        ) : recentBills.length > 0 ? (
          recentBills.map((bill: Bill) => (
            <TouchableOpacity
              key={bill._id}
              style={styles.billItem}
            >
              <View style={styles.billHeader}>
                <Text style={styles.billTitle}>Order #{bill.billNumber}</Text>
                <Text style={[styles.billStatus, { color: bill.amountPaid >= bill.total ? '#34D399' : '#F59E0B' }]}>
                  {bill.amountPaid >= bill.total ? 'Paid' : `₹${(bill.total - bill.amountPaid).toFixed(2)} Pending`}
                </Text>
              </View>
              
              <View style={styles.productsList}>
                {bill?.items?.map((item: any, index: number) => (
                  <Text key={index} style={styles.productItem} numberOfLines={1}>
                    • {item.product?.name || 'Unknown Product'} (Qty: {item.quantity})
                  </Text>
                ))}
              </View>

              <View style={styles.billInfo}>
                <View>
                  <Text style={styles.billTotalAmount}>Total: ₹{bill.total?.toFixed(2)}</Text>
                  {bill.amountPaid > 0 && (
                    <Text style={styles.paidAmount}>Paid: ₹{bill.amountPaid?.toFixed(2)}</Text>
                  )}
                </View>
                <Text style={styles.billDate}>{new Date(bill.createdAt).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ color: "#6b7280" }}>No recent bills found</Text>
        )}
      </View>

      {/* Current Bill */}
      

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  billSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4b5563',
  },
  billValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  amountInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 8,
    width: 120,
    textAlign: 'right',
    fontSize: 16,
    color: '#1f2937',
  },
  billItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  billStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  billInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  billDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  productsList: {
    marginVertical: 8,
  },
  productItem: {
    fontSize: 14,
    color: '#4b5563',
    marginVertical: 2,
  },
  paidAmount: {
    fontSize: 14,
    color: '#34D399',
    fontWeight: '500',
  },
  billTotalAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
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
  currentBillItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  billText: { fontSize: 16 },
  currentBillAmount: { fontWeight: "600", fontSize: 16 },
  billTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingTop: 8,
  },
  billTotalText: { fontWeight: "700", fontSize: 17 },

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
