import React, {  useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi, TransactionDto } from '../../services/api';
import { format } from 'date-fns';
import { useFlashMessage, FlashMessageContainer } from './FlashMessage';

type TransactionItem = TransactionDto;

const TransactionHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const { messages, dismissMessage, showSuccess, showError, showInfo } = useFlashMessage();
  const { } = useAuth();
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ['transactions', 1, 50],
    queryFn: () => transactionsApi.list(1, 50),
  });
  const transactions: TransactionItem[] = data?.transactions || [];

  const [searchCustomer, setSearchCustomer] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'Date' | 'Status' | 'Payment' | 'Amount' | null>(null);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(['Cash', 'Online']);
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [showAmountFilter, setShowAmountFilter] = useState(false);
 
  const filteredTransactions = useMemo(() => {
    const normalize = (s?: string) => (s || '').toLowerCase();

    return (transactions || []).filter((t: TransactionItem) => {
      const tDate = new Date(t.createdAt);

      const matchesDateRange =
        (!startDate || tDate >= startDate) &&
        (!endDate || tDate <= endDate);

      const titleMsg = `${t.title} ${t.message}`;
      const matchesCustomer = !searchCustomer || normalize(titleMsg).includes(normalize(searchCustomer));

      const transactionStatus = ((t.data as any)?.paymentStatus ?? 'Pending');
      const matchesStatus = paymentStatus === 'All' || transactionStatus === paymentStatus;

      const method = ((t.data as any)?.paymentMethod ?? 'Cash');
      const matchesMethod = selectedPaymentMethods.length === 2 || selectedPaymentMethods.includes(method);

      const totalVal = Number(((t.data as any)?.totalAmount ?? (t.data as any)?.total ?? 0));
      const minOk = !amountRange.min || totalVal >= Number(amountRange.min);
      const maxOk = !amountRange.max || totalVal <= Number(amountRange.max);
      const matchesAmount = minOk && maxOk;

      return matchesDateRange && matchesCustomer && matchesStatus && matchesMethod && matchesAmount;
    });
  }, [transactions, startDate, endDate, searchCustomer, paymentStatus, selectedPaymentMethods, amountRange.min, amountRange.max]);

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSearchCustomer('');
    setPaymentStatus('All');
    setSelectedPaymentMethods(['Cash', 'Online']);
    setAmountRange({ min: '', max: '' });
  };

  const hasActiveFilters = startDate || endDate || searchCustomer || paymentStatus !== 'All' || selectedPaymentMethods.length < 2 || !!amountRange.min || !!amountRange.max;

  const handleDeleteTransaction = async (id: string) => {
    try {
      await transactionsApi.remove(id);
      await refetch();
      showSuccess('Transaction deleted', 'Deleted');
    } catch (e) {
      // Error suppressed
    }
  };

  const handleClearAllTransactions = async () => {
    Alert.alert(
      'Clear All Transactions',
      'Are you sure you want to delete all transactions? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await transactionsApi.removeAll();
              await refetch();
              showSuccess('All transactions cleared', 'Success');
            } catch (e) {
              // Error suppressed
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  const renderBill = ({ item }: { item: TransactionItem }) => (
    <View style={styles.billCard}>
      {/* Header with Date and Status */}
      <View style={styles.billHeader}>
        <View style={styles.billDateContainer}>
          <Text style={styles.billDateEmoji}>📅</Text>
          <Text style={styles.billDate}>
            {format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[
            styles.statusBadge,
            ((item.data as any)?.paymentStatus ?? 'Pending') === 'Paid' ? styles.statusPaid : styles.statusPending,
          ]}>
            <Text style={styles.statusText}>
              {((item.data as any)?.paymentStatus ?? 'Pending') === 'Paid' ? '✓' : '⏱'} {((item.data as any)?.paymentStatus ?? 'Pending')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDeleteTransaction(item._id)} style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 16, color: '#9CA3AF' }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction Summary */}
      <View style={styles.billSection}>
        <Text style={styles.sectionEmoji}>👤</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.customerName}>{(item.data as any)?.customerName ?? 'Unknown Customer'}</Text>
          <Text style={{ color: '#6b7280', marginTop: 4 }}>Bill #{(item.data as any)?.billNumber ?? '—'}</Text>
        </View>
      </View>

      {/* Totals Snapshot */}
      <View style={styles.billSection}>
        <Text style={styles.sectionEmoji}>💰</Text>
        <View style={styles.itemsList}>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Total Amount</Text>
            <Text style={styles.itemQuantity}>₹{Number((item.data as any)?.totalAmount ?? (item.data as any)?.total ?? 0).toFixed(2)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Pending Amount</Text>
            <Text style={styles.itemQuantity}>₹{Number((item.data as any)?.remainingAmount ?? Math.max(0, Number((item.data as any)?.totalAmount ?? (item.data as any)?.total ?? 0) - Number((item.data as any)?.amountPaid ?? 0))).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Footer with Payment Method and Total */}
      <View style={styles.billFooter}>
        <View style={styles.paymentMethod}>
          <Text style={styles.paymentEmoji}>
            {((item.data as any)?.paymentMethod ?? 'Cash') === 'Cash' ? '💵' : '💳'}
          </Text>
          <Text style={styles.paymentText}>{(item.data as any)?.paymentMethod ?? 'Cash'}</Text>
        </View>
       
      </View>
    </View>
  );

  if (isLoading && !transactions) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error) {
    // Error suppressed
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <FlashMessageContainer messages={messages} onDismiss={dismissMessage} />
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>Failed to load data</Text>
            <Text style={styles.errorMessage}>
              Please ensure you are logged in and the server is reachable.
            </Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>🔄 Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backEmoji}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <Text style={styles.headerSubtitle}>
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'entry' : 'entries'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClearAllTransactions} style={styles.clearAllButton}>
          <Text style={styles.clearAllButtonEmoji}>🗑️</Text>
          <Text style={styles.clearAllButtonText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scrollable Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScrollContainer}
        style={styles.filtersScroll}
      >
        {/* Date Range Filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            (startDate || endDate) && styles.filterChipActive
          ]}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.filterEmoji}>📅</Text>
          <Text style={[
            styles.filterText,
            (startDate || endDate) && styles.filterTextActive
          ]}>
            {startDate && endDate
              ? `${format(startDate, 'dd MMM')} - ${format(endDate, 'dd MMM')}`
              : startDate
              ? `From ${format(startDate, 'dd MMM')}`
              : endDate
              ? `To ${format(endDate, 'dd MMM')}`
              : 'Date'}
          </Text>
        </TouchableOpacity>

        {/* Customer Filter */}
        <View style={[
          styles.filterChip,
          searchCustomer && styles.filterChipActive
        ]}>
          <Text style={styles.filterEmoji}>👤</Text>
          <TextInput
            style={[
              styles.filterInput,
              searchCustomer && styles.filterInputActive
            ]}
            placeholder="Customer"
            value={searchCustomer}
            onChangeText={setSearchCustomer}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Payment Status Filter */}
        <TouchableOpacity
          onPress={() => {
            if (paymentStatus === 'All') setPaymentStatus('Paid');
            else if (paymentStatus === 'Paid') setPaymentStatus('Pending');
            else setPaymentStatus('All');
            const count = filteredTransactions.length;
          }}
          style={[
            styles.filterChip,
            paymentStatus !== 'All' && styles.filterChipActive
          ]}
        >
          <Text style={styles.filterEmoji}>
            {paymentStatus === 'Paid' ? '✓' : paymentStatus === 'Pending' ? '⏱' : '📊'}
          </Text>
          <Text style={[
            styles.filterText,
            paymentStatus !== 'All' && styles.filterTextActive
          ]}>
            {paymentStatus}
          </Text>
        </TouchableOpacity>

        {/* Payment Method Filter */}
      

        {/* Amount Filter */}
      
         

        {/* Clear Filters */}
        {hasActiveFilters && (
          <TouchableOpacity
            onPress={clearFilters}
            style={styles.clearFilterChip}
          >
            <Text style={styles.clearFilterText}>✕ Clear</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              setShowStartPicker(false);
            }
            if (selectedDate && event.type === 'set') {
              setStartDate(selectedDate);
              if (Platform.OS === 'ios') {
                setShowStartPicker(false);
              }
              setTimeout(() => setShowEndPicker(true), 300);
            } else if (event.type === 'dismissed') {
              setShowStartPicker(false);
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate || startDate || new Date()}
          mode="date"
          minimumDate={startDate || undefined}
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate && event.type === 'set') {
              setEndDate(selectedDate);
            }
          }}
        />
      )}

      {/* Amount Filter Modal */}
     

      {/* Transactions List */}
      {(!transactions || transactions.length === 0) ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyMessage}>Create your first bill to see it here</Text>
          </View>
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No matching transactions</Text>
            <Text style={styles.emptyMessage}>Try adjusting your filters</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderBill}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={!!isLoading} 
             
              tintColor="#6366F1"
              colors={['#6366F1']}
            />
          }
      />
    )}
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    gap: 6,
  },
  clearAllButtonEmoji: {
    fontSize: 16,
  },
  clearAllButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  backEmoji: {
    fontSize: 20,
    color: '#374151',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
 filtersScroll: {
  backgroundColor: '#fff',
  marginHorizontal: 16,
  borderRadius: 16,
  height: 50,
  minHeight: 50,
  maxHeight: 50,
},

 filtersScrollContainer: {
  paddingHorizontal: 12,
  paddingVertical: 14,
  flexDirection: 'row',
  alignItems: 'center',
},
filterChip: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F9FAFB',
  borderRadius: 10,
  paddingHorizontal: 10,
  paddingVertical: 8,
  borderWidth: 1.2,
  borderColor: '#E5E7EB',
  marginRight: 10,
  height: 38,
  maxWidth: 140,
},


  filterChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  filterText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    maxWidth: 120,
  },
  filterTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  filterInput: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    width: 80,
    padding: 0,
  },
  filterInputActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  statusFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 8,
  },
  statusFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  statusFilterChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  statusFilterText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  statusFilterTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  clearFilterChip: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    height: 36,
    justifyContent: 'center',
  },
  clearFilterText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  
  listContainer: {
    padding: 16,
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  billDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billDateEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  billDate: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPaid: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  billSection: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  sectionEmoji: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  itemsList: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 8,
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paymentEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  paymentText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },
  errorMessage: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 20,
  },
});

export default TransactionHistoryScreen;