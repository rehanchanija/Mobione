import React from 'react';
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
        status: 'Paid' | 'Pending' | 'Cancelled';
        date: string;
        paymentMethod: 'Cash' | 'Online';
      };
    };
  };
}

export default function SalesDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { bill } = route.params as SalesDetailScreenProps['route']['params'];

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Paid':
        return styles.paidBadge;
      case 'Pending':
        return styles.pendingBadge;
      case 'Cancelled':
        return styles.cancelledBadge;
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
      case 'Cancelled':
        return styles.cancelledText;
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
      case 'Cancelled':
        return '❌';
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
              <Text style={styles.infoLabel}>Amount:</Text>
              <Text style={styles.amountValue}>₹{bill.amount.toFixed(2)}</Text>
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
          >
            <Text style={[styles.actionButtonText, bill.status === 'Pending' ? styles.primaryButtonText : styles.disabledButtonText]}>
              Mark as Paid
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  cancelledBadge: { backgroundColor: '#FFEBEE' },
  cashBadge: { backgroundColor: '#E3F2FD' },
  onlineBadge: { backgroundColor: '#E8F5E9' },
  paidText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  pendingText: { fontSize: 12, fontWeight: '600', color: '#EF6C00' },
  cancelledText: { fontSize: 12, fontWeight: '600', color: '#C62828' },
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
  },
  disabledButtonText: {
    color: '#999999',
  },
});