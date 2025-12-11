import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
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
  
  const { useBills } = useAuth();
  const { data: billsResponse, isLoading } = useBills(1, 5);

  const recentBills = billsResponse?.bills || [];

  const getStatusColor = (bill: Bill) => {
    return bill.amountPaid >= bill.total ? '#10B981' : '#F59E0B';
  };

  const getStatusText = (bill: Bill) => {
    return bill.amountPaid >= bill.total ? 'Fully Paid' : 'Pending';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Start New Bill */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🚀</Text>
          <Text style={styles.sectionTitle}>Start New Bill</Text>
        </View>
        <TouchableOpacity 
          style={styles.primaryBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnIcon}>📷</Text>
          <Text style={styles.primaryBtnText}>Scan Barcode</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.secondaryBtn} 
          onPress={() => navigation.navigate("Product", { allProducts: true, selectForBill: true })}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnIcon}>🛒</Text>
          <Text style={styles.secondaryBtnText}>Select Products</Text>
        </TouchableOpacity>
      </View>

      {/* Current Bill */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🧮</Text>
          <Text style={styles.sectionTitle}>Current Bill</Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No items selected yet</Text>
            <Text style={styles.emptySubtext}>Add products to start billing</Text>
          </View>
        ) : (
          <>
            {items.map((it, idx) => (
              <View style={styles.currentBillItem} key={`${it.productId}-${idx}`}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{it.name}</Text>
                  <Text style={styles.itemQuantity}>
                    {it.quantity} × ₹{it.unitPrice.toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.itemAmount}>
                  ₹{(it.unitPrice * it.quantity).toLocaleString()}
                </Text>
              </View>
            ))}

            <View style={styles.billTotal}>
              <Text style={styles.billTotalLabel}>Subtotal</Text>
              <Text style={styles.billTotalAmount}>
                ₹{items.reduce((s, it) => s + it.unitPrice * it.quantity, 0).toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.proceedBtn}
              onPress={() => navigation.navigate("BillDetails", { items })}
              activeOpacity={0.8}
            >
              <Text style={styles.proceedBtnText}>Proceed to Bill</Text>
              <Text style={styles.proceedBtnIcon}>→</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Recent Orders */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.cardIcon}>📋</Text>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
          </View>
         
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : recentBills.length > 0 ? (
          recentBills.map((bill: Bill) => (
            <TouchableOpacity
              key={bill._id}
              style={styles.orderCard}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <Text style={styles.orderNumber}>#{bill.billNumber}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(bill)}20` }
                  ]}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(bill) }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(bill) }
                    ]}>
                      {getStatusText(bill)}
                    </Text>
                  </View>
                </View>
                <View style={styles.orderHeaderRight}>
                  <Text style={styles.orderTotal}>₹{bill.total?.toLocaleString()}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(bill.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
              
              <View style={styles.productsList}>
                {bill?.items?.slice(0, 2).map((item: any, index: number) => (
                  <View key={index} style={styles.productRow}>
                    <Text style={styles.productDot}>•</Text>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.product?.name || 'Unknown Product'}
                    </Text>
                    <Text style={styles.productQty}>×{item.quantity}</Text>
                  </View>
                ))}
                {bill?.items?.length > 2 && (
                  <Text style={styles.moreItems}>
                    +{bill.items.length - 2} more items
                  </Text>
                )}
              </View>

              {bill.amountPaid > 0 && bill.amountPaid < bill.total && (
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Paid:</Text>
                    <Text style={styles.paymentPaid}>₹{bill.amountPaid?.toLocaleString()}</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Pending:</Text>
                    <Text style={styles.paymentPending}>
                      ₹{(bill.total - bill.amountPaid).toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No recent orders</Text>
            <Text style={styles.emptySubtext}>Your recent bills will appear here</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F7FA",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: "#111827",
    letterSpacing: 0.3,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  primaryBtn: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  primaryBtnIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  primaryBtnText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 16,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  secondaryBtnIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  secondaryBtnText: { 
    color: "#374151", 
    fontWeight: "700", 
    fontSize: 16,
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  currentBillItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: { 
    fontSize: 15, 
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  itemQuantity: { 
    fontSize: 14, 
    color: "#6B7280",
    fontWeight: "500",
  },
  itemAmount: { 
    fontWeight: "700", 
    fontSize: 16,
    color: "#3B82F6",
  },
  billTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#E5E7EB",
  },
  billTotalLabel: { 
    fontWeight: "700", 
    fontSize: 18,
    color: "#111827",
  },
  billTotalAmount: { 
    fontWeight: "800", 
    fontSize: 20,
    color: "#3B82F6",
  },
  proceedBtn: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginTop: 16,
    shadowColor: "#10B981",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  proceedBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  proceedBtnIcon: {
    color: "#fff",
    fontSize: 20,
    marginLeft: 8,
    fontWeight: "700",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  orderCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  orderHeaderRight: {
    alignItems: "flex-end",
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  productsList: {
    marginBottom: 8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  productDot: {
    fontSize: 16,
    color: "#9CA3AF",
    marginRight: 8,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  productQty: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    marginLeft: 8,
  },
  moreItems: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600",
    marginTop: 4,
    marginLeft: 24,
  },
  paymentInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 3,
  },
  paymentLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  paymentPaid: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "700",
  },
  paymentPending: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "700",
  },
});