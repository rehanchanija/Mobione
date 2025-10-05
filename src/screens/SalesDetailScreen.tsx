import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

interface SalesDetailScreenProps {
  route: {
    params: {
      bill: {
        id: string;
        customerName: string;
        amount: number;
        status: 'Paid' | 'Pending';
        date: string;
        paymentMethod: 'Cash' | 'Online';
        advanceAmount?: number;
        pendingAmount?: number;
        discount?: number;
        items: { name: string; price: number; quantity: number }[];
        customeradress?: string;
        subTotal?: number;
      };
    };
  };
}

export default function SalesDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { bill } = route.params as SalesDetailScreenProps['route']['params'];

  // Calculate amounts
  const subtotal = bill.subTotal || bill.amount + (bill.pendingAmount || 0);
  const discount = bill.discount || 0;
  const afterDiscount = subtotal - discount;
  const advanceAmount = bill.advanceAmount || 0;

  // Final payable and pending
  const finalAmount = afterDiscount - advanceAmount;
  const pendingAmount = finalAmount > 0 ? finalAmount : 0;

  // Determine status dynamically
  const status = pendingAmount <= 0 ? 'Paid' : bill.status;

  const [showSettlementInfo, setShowSettlementInfo] = useState(false);

  const handleMarkAsPaid = () => {
    setShowSettlementInfo(true);

    const updatedBill = {
      ...bill,
      status: 'Paid',
      advanceAmount: advanceAmount + pendingAmount,
      pendingAmount: 0,
      subTotal: subtotal,
    };

    setTimeout(() => {
      navigation.navigate('SalesAnalytics', { updatedBill });
    }, 2000);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Paid':
        return styles.paidBadge;
      case 'Pending':
        return styles.pendingBadge;
      default:
        return {};
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'Paid':
        return styles.paidText;
      case 'Pending':
        return styles.pendingText;
      default:
        return {};
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'Paid':
        return '✅';
      case 'Pending':
        return '⏳';
      default:
        return '📝';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sale Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {/* Bill Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bill ID:</Text>
              <Text style={styles.infoValue}>{bill.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{bill.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
                <Text style={getStatusTextStyle(status)}>
                  {getStatusEmoji(status)} {status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{bill.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{bill.customeradress}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Product Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Information</Text>
            {bill?.items.map((item, index) => (
              <View key={index} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item?.name}</Text>
                <Text style={styles.infoValue}>
                  ₹{item.price} x {item.quantity}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

<View style={styles.section}>
  <Text style={styles.sectionTitle}>Payment Information</Text>

  {/* Total Amount */}
  <View style={[styles.infoRow, styles.paymentRow]}>
    <Text style={styles.paymentLabel}>Total Amount</Text>
    <Text style={styles.totalAmountValue}>₹{subtotal.toFixed(2)}</Text>
  </View>

  {/* Discount */}
  <View style={[styles.infoRow, styles.paymentRow]}>
    <Text style={styles.paymentLabel}>Discount</Text>
    <Text style={styles.discountValue}>-₹{discount.toFixed(2)} ({((discount/subtotal)*100).toFixed(0)}%)</Text>
  </View>

  {/* Amount After Discount */}
  <View style={[styles.infoRow, styles.paymentRow]}>
    <Text style={styles.paymentLabel}>Amount  Payable</Text>
    <Text style={styles.amountValue}>₹{afterDiscount.toFixed(2)}</Text>
  </View>

  {/* Advance Paid */}
  <View style={[styles.infoRow, styles.paymentRow]}>
    <Text style={styles.paymentLabel}>Amount Paid</Text>
    <Text style={styles.advanceValue}>₹{advanceAmount.toFixed(2)}</Text>
  </View>

  {/* Pending Amount */}
  {pendingAmount > 0 && (
    <View style={[styles.infoRow, styles.paymentRow]}>
      <Text style={styles.paymentLabel}>Amount Due</Text>
      <Text style={styles.pendingValue}>₹{pendingAmount.toFixed(2)}</Text>
    </View>
  )}

  {/* Payment Status */}
  <View style={[styles.infoRow, styles.paymentRow]}>
    <Text style={styles.paymentLabel}>Payment Status</Text>
    <View style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
      <Text style={getStatusTextStyle(status)}>
        {getStatusEmoji(status)} {status}
      </Text>
    </View>
  </View>
</View>

        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Print Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, status === 'Pending' ? styles.primaryButton : styles.disabledButton]}
            disabled={status !== 'Pending'}
            onPress={handleMarkAsPaid}
          >
            <Text style={[styles.actionButtonText, status === 'Pending' ? styles.primaryButtonText : styles.disabledButtonText]}>
              Mark as Paid
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Settlement Info Overlay */}
      {showSettlementInfo && (
        <View style={styles.settlementOverlay}>
          <View style={styles.settlementCard}>
            <Text style={styles.settlementTitle}>Payment Complete! ✅</Text>
            <Text style={styles.settlementText}>All settlement has been paid</Text>

            <View style={styles.settlementDetails}>
              <Text style={styles.settlementLabel}>Subtotal:</Text>
              <Text style={styles.settlementValue}>₹{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.settlementDetails}>
              <Text style={styles.settlementLabel}>Discount:</Text>
              <Text style={styles.settlementValue}>₹{discount.toFixed(2)}</Text>
            </View>
            <View style={styles.settlementDetails}>
              <Text style={styles.settlementLabel}>Final Amount:</Text>
              <Text style={styles.settlementValue}>₹{afterDiscount.toFixed(2)}</Text>
            </View>
            <View style={styles.settlementDetails}>
              <Text style={styles.settlementLabel}>Advance Paid:</Text>
              <Text style={styles.settlementValue}>₹{advanceAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.settlementDetails}>
              <Text style={styles.settlementLabel}>Pending Amount:</Text>
              <Text style={styles.settlementValue}>₹{pendingAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.settlementDetails}>
              <Text style={styles.settlementLabel}>Status:</Text>
              <Text style={styles.settlementPaidStatus}>{pendingAmount <= 0 ? 'Paid' : 'Pending'}</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 16, color: '#0066FF', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  placeholder: { width: 50 },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '600' },
 
  divider: { height: 1, backgroundColor: '#E5E5E5', marginVertical: 16 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  paidBadge: { backgroundColor: '#E8F5E9' },
  pendingBadge: { backgroundColor: '#FFF3E0' },
  cashBadge: { backgroundColor: '#E3F2FD' },
  onlineBadge: { backgroundColor: '#E8F5E9' },
  paidText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  pendingText: { fontSize: 12, fontWeight: '600', color: '#EF6C00' },
  cashText: { fontSize: 12, fontWeight: '600', color: '#1565C0' },
  onlineText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  paymentBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  actionButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#F5F5F5', marginHorizontal: 4, alignItems: 'center' },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  primaryButton: { backgroundColor: '#0066FF' },
  primaryButtonText: { color: '#FFF' },
  disabledButton: { backgroundColor: '#F5F5F5', opacity: 0.5, color: '#999' },
  disabledButtonText: { color: '#999' },
  settlementOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  settlementCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '80%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  settlementTitle: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginBottom: 12, textAlign: 'center' },
  settlementText: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  settlementDetails: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  settlementLabel: { fontSize: 16, color: '#666' },
  settlementValue: { fontSize: 16, fontWeight: 'bold', color: '#0066FF' },
  settlementPaidStatus: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
  paymentRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
paymentLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
totalAmountValue: { fontSize: 16, fontWeight: '700', color: '#1A237E' },
discountValue: { fontSize: 16, fontWeight: '700', color: '#D32F2F' },
amountValue: { fontSize: 16, fontWeight: '700', color: '#0066FF' },
advanceValue: { fontSize: 16, fontWeight: '700', color: '#2E7D32' },
pendingValue: { fontSize: 16, fontWeight: '700', color: '#EF6C00' },

});
