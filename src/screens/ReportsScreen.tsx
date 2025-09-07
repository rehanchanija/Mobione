import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Bill {
  id: string;
  customerName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Cancelled';
  date: string;
}

const bills: Bill[] = [
  { id: 'FPT001', customerName: 'Alice Johnson', amount: 150.75, status: 'Paid', date: '2024-07-20' },
  { id: 'FPT002', customerName: 'Bob Williams', amount: 89.90, status: 'Pending', date: '2024-07-19' },
  { id: 'FPT003', customerName: 'Charlie Davis', amount: 230.00, status: 'Paid', date: '2024-07-18' },
  { id: 'FPT004', customerName: 'Diana Miller', amount: 45.50, status: 'Cancelled', date: '2024-07-18' },
  { id: 'FPT005', customerName: 'Ethan White', amount: 320.40, status: 'Paid', date: '2024-07-17' },
  { id: 'FPT006', customerName: 'Fiona Green', amount: 112.30, status: 'Pending', date: '2024-07-16' },
  { id: 'FPT007', customerName: 'George Black', amount: 99.00, status: 'Paid', date: '2024-07-15' },
  { id: 'FPT008', customerName: 'Hannah Brown', amount: 55.60, status: 'Paid', date: '2024-07-14' },
];

export default function ReportsScreen() {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState<'Date' | 'Customer' | 'Status' | 'Amount'>('Date');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Paid':
        return [styles.statusBadge, styles.paidBadge];
      case 'Pending':
        return [styles.statusBadge, styles.pendingBadge];
      case 'Cancelled':
        return [styles.statusBadge, styles.cancelledBadge];
      default:
        return [styles.statusBadge];
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'Paid':
        return '✅';
      case 'Pending':
        return '⏳';
      case 'Cancelled':
        return '❌';
      default:
        return '📝';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports 📊</Text>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Filter Bills</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'Date' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('Date')}
          >
            <Text style={[styles.filterText, activeFilter === 'Date' && styles.filterTextActive]}>
              � Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'Customer' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('Customer')}
          >
            <Text style={[styles.filterText, activeFilter === 'Customer' && styles.filterTextActive]}>
              👤 Customer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'Status' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('Status')}
          >
            <Text style={[styles.filterText, activeFilter === 'Status' && styles.filterTextActive]}>
              🔄 Status
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'Amount' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('Amount')}
          >
            <Text style={[styles.filterText, activeFilter === 'Amount' && styles.filterTextActive]}>
              💰 Amount
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Bill History */}
      <View style={styles.billSection}>
        <Text style={styles.sectionTitle}>Bill History</Text>
        <ScrollView style={styles.billList}>
          {bills.map((bill) => (
            <TouchableOpacity
              key={bill.id}
              style={styles.billItem}
              onPress={() => {/* Navigate to bill details */}}
            >
              <View style={styles.billHeader}>
                <Text style={styles.billId}>Bill ID: {bill.id}</Text>
                <Text style={styles.billDate}>{bill.date}</Text>
              </View>
              
              <View style={styles.billContent}>
                <View>
                  <Text style={styles.customerName}>{bill.customerName}</Text>
                  <Text style={getStatusStyle(bill.status)}>
                    {getStatusEmoji(bill.status)} {bill.status}
                  </Text>
                </View>
                <Text style={styles.amount}>₹{bill.amount.toFixed(2)}</Text>
              </View>
              
              <TouchableOpacity style={styles.viewDetails}>
                <Text style={styles.viewDetailsText}>View Details 👉</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  filterSection: {
    padding: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterButtonActive: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  billSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  billList: {
    flex: 1,
  },
  billItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billId: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  billDate: {
    fontSize: 14,
    color: '#666666',
  },
  billContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  paidBadge: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
    color: '#EF6C00',
  },
  cancelledBadge: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066FF',
  },
  viewDetails: {
    alignSelf: 'flex-end',
  },
  viewDetailsText: {
    color: '#0066FF',
    fontSize: 14,
    fontWeight: '600',
  },
});
