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
      };
    };
  };
}

export default function SalesDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { bill } = route.params as SalesDetailScreenProps['route']['params'];
  
  // Calculate advance and pending amounts if not provided
  const advanceAmount = bill.advanceAmount || (bill.status === 'Paid' ? bill.amount : bill.amount * 0.3);
  const pendingAmount = bill.pendingAmount || (bill.status === 'Paid' ? 0 : bill.amount * 0.7);
  
  const [showSettlementInfo, setShowSettlementInfo] = useState(false);

  const handleMarkAsPaid = () => {
    // Show settlement info
    setShowSettlementInfo(true);
    
    // Create a new bill object with updated status and settled amounts
    const updatedBill = {
      ...bill,
      status: 'Paid',
      advanceAmount: bill.amount, // Full amount is now paid
      pendingAmount: 0, // No pending amount
    };
    
    // Navigate back to the analytics screen with the updated bill after a short delay
    setTimeout(() => {
      navigation.navigate('SalesAnalytics', { updatedBill });
    }, 2000); // 2 second delay to show the settlement info
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sale Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
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
              <View style={[styles.statusBadge, getStatusBadgeStyle(bill.status)]}>
                <Text style={getStatusTextStyle(bill.status)}>
                  {getStatusEmoji(bill.status)} {bill.status}
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
            {/* Additional customer information can be added here */}
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Amount:</Text>
              <Text style={styles.amountValue}>₹{bill.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Advance Amount:</Text>
              <Text style={styles.advanceValue}>₹{advanceAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pending Amount:</Text>
              <Text style={styles.pendingValue}>₹{pendingAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Method:</Text>
              <View style={[styles.paymentBadge, bill.paymentMethod === 'Cash' ? styles.cashBadge : styles.onlineBadge]}>
                <Text style={bill.paymentMethod === 'Cash' ? styles.cashText : styles.onlineText}>
                  {bill.paymentMethod === 'Cash' ? '💵' : '💳'} {bill.paymentMethod}
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
            style={[styles.actionButton, bill.status === 'Pending' ? styles.primaryButton : styles.disabledButton]}
            disabled={bill.status !== 'Pending'}
            onPress={handleMarkAsPaid}
          >
            <Text style={[styles.actionButtonText, bill.status === 'Pending' ? styles.primaryButtonText : styles.disabledButtonText]}>
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
              <Text style={styles.settlementLabel}>Total Amount:</Text>
              <Text style={styles.settlementValue}>₹{bill.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.settlementDetails}>
              <Text style={styles.settlementLabel}>Status:</Text>
              <Text style={styles.settlementPaidStatus}>Paid</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '700',
  },
  advanceValue: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '700',
  },
  pendingValue: {
    fontSize: 16,
    color: '#EF6C00',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  paidBadge: { backgroundColor: '#E8F5E9' },
  pendingBadge: { backgroundColor: '#FFF3E0' },
  cashBadge: { backgroundColor: '#E3F2FD' },
  onlineBadge: { backgroundColor: '#E8F5E9' },
  paidText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  pendingText: { fontSize: 12, fontWeight: '600', color: '#EF6C00' },
  cashText: { fontSize: 12, fontWeight: '600', color: '#1565C0' },
  onlineText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  paymentBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  primaryButton: {
    backgroundColor: '#0066FF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    opacity: 0.5,
    color: '#999999',
  },
  disabledButtonText: {
    color: '#999999',
  },
  settlementOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  settlementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settlementTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  settlementText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  settlementDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  settlementLabel: {
    fontSize: 16,
    color: '#666666',
  },
  settlementValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  settlementPaidStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
 
 
  
  
});