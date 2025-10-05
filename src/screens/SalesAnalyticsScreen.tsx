import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

interface BillItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Bill {
  _id: string;
  billNumber: string;
  customerId?: string;
  customer?: {
    name: string;
    phone?: string;
    address?: string;
  };
  items: BillItem[];
  subtotal: number;
  total: number;
  discount?: number;
  paymentMethod: 'Cash' | 'Online';
  amountPaid: number;
  createdAt: string;
}
  


interface ProductInfo {
  _id: string;
  name: string;
  price: number;
}

export default function SalesAnalyticsScreen({ route }: any) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { useBills, useProduct } = useAuth();
  
  // Fetch all bills
  const { data: bills, isLoading: isLoadingBills } = useBills();
  
  // Transform bills data to include status
  const transformedBills = useMemo(() => {
    if (!bills) return [];
    
    return bills.map((bill: Bill) => {
      // Calculate subtotal from items if not provided
      const subtotal = bill.subtotal || bill.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...bill,
        subtotal,
        status: bill.amountPaid >= bill.total ? 'Paid' as const : 'Pending' as const,
        customerName: bill.customer?.name || 'Unknown',
      };
    });
  }, [bills]);
  
  // Set bills data
  const [billsData, setBillsData] = useState<Bill[]>([]);
  
  // Update bills data when transformed bills change
  React.useEffect(() => {
    setBillsData(transformedBills);
  }, [transformedBills]);
  
  // Check if we have an updated bill from the detail screen
  React.useEffect(() => {
    if (route.params?.updatedBill) {
      const updatedBill = route.params.updatedBill;
      // Update the bills array with the updated bill
      setBillsData(prevBills => {
        return prevBills.map(bill => 
          bill._id === updatedBill.id ? updatedBill : bill
        );
      });
      // Clear the route params to prevent re-updating on re-renders
      navigation.setParams({ updatedBill: undefined });
    }
  }, [route.params?.updatedBill, navigation]);
  
  const [activeFilter, setActiveFilter] = useState<'Date' | 'Customer' | 'Status' | 'Amount' | 'Payment'>('Date');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Paid', 'Pending']);
  const [showAmountFilter, setShowAmountFilter] = useState(false);
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showPaymentFilter, setShowPaymentFilter] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(['Cash', 'Online']);

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

  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // Enhanced filtering and sorting logic
  const processedBills = useMemo(() => {
    let filtered = [...billsData];

    // Filter by search query (name and bill ID)
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (bill) =>
          bill?.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bill._id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected statuses
    filtered = filtered.filter(bill => {
      const status = bill.amountPaid >= bill.total ? 'Paid' : 'Pending';
      return selectedStatuses.includes(status);
    });

    // Filter by selected payment methods
    filtered = filtered.filter(bill => selectedPaymentMethods.includes(bill.paymentMethod));

    // Filter by amount range
    if (amountRange.min || amountRange.max) {
      filtered = filtered.filter(bill => {
        const min = amountRange.min ? parseFloat(amountRange.min) : 0;
        const max = amountRange.max ? parseFloat(amountRange.max) : Infinity;
        return bill.total >= min && bill.total <= max;
      });
    }

    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(bill => {
        const billDate = new Date(bill.createdAt);
        const startDate = dateRange.start ? new Date(dateRange.start) : new Date('1900-01-01');
        const endDate = dateRange.end ? new Date(dateRange.end) : new Date('2100-12-31');
        return billDate >= startDate && billDate <= endDate;
      });
    }

    // Sort based on active filter
    switch (activeFilter) {
      case 'Date':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'Customer':
        filtered.sort((a, b) => +(a.customer?.name || '').localeCompare(b.customer?.name || ''));
        break;
      case 'Status':
        const statusOrder = { Paid: 1, Pending: 2 };
        filtered.sort((a, b) => {
          const aStatus = a.amountPaid >= a.total ? 'Paid' : 'Pending';
          const bStatus = b.amountPaid >= b.total ? 'Paid' : 'Pending';
          return statusOrder[aStatus] - statusOrder[bStatus];
        });
        break;
      case 'Amount':
        filtered.sort((a, b) => b.total - a.total);
        break;
      case 'Payment':
        filtered.sort((a, b) => a.paymentMethod.localeCompare(b.paymentMethod));
        break;
    }

    return filtered;
  }, [activeFilter, searchQuery, selectedStatuses, amountRange, dateRange,selectedPaymentMethods]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatuses(['Paid', 'Pending']);
    setAmountRange({ min: '', max: '' });
    setDateRange({ start: '', end: '' });
    setSelectedPaymentMethods(['Cash', 'Online']);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedStatuses.length < 2) count++;
    if (selectedPaymentMethods.length < 2) count++;
    if (amountRange.min || amountRange.max) count++;
    if (dateRange.start || dateRange.end) count++;
    return count;
  };

  return (
    <SafeAreaView style={styles.container}>
    
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filter & Bills</Text>
          {getActiveFiltersCount() > 0 && (
            <TouchableOpacity onPress={clearAllFilters} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All ({getActiveFiltersCount()})</Text>
            </TouchableOpacity>
          )}
        </View>

<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
  {/* Date → opens Date modal */}
  <TouchableOpacity
    style={[styles.filterButton, activeFilter === 'Date' && styles.filterButtonActive]}
    onPress={() => {
      setActiveFilter('Date');
      setShowDateFilter(true); // 👈 open date filter modal
    }}
  >
    <Text style={[styles.filterText, activeFilter === 'Date' && styles.filterTextActive]}>
      📅 Date {(dateRange.start || dateRange.end) ? '✓' : ''}
    </Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.filterButton, activeFilter === 'Status' && styles.filterButtonActive]}
    onPress={() => {
      setActiveFilter('Status');
      setShowStatusFilter(true); // 👈 open status filter modal
    }}
  >
    <Text style={[styles.filterText, activeFilter === 'Status' && styles.filterTextActive]}>
      🔄 Status ({selectedStatuses.length}/2)
    </Text>
  </TouchableOpacity>

  {/* Payment Method → opens Payment modal */}
  <TouchableOpacity
    style={[styles.filterButton, activeFilter === 'Payment' && styles.filterButtonActive]}
    onPress={() => {
      setActiveFilter('Payment');
      setShowPaymentFilter(true); // 👈 open payment filter modal
    }}
  >
    <Text style={[styles.filterText, activeFilter === 'Payment' && styles.filterTextActive]}>
      💳 Payment ({selectedPaymentMethods.length}/2)
    </Text>
  </TouchableOpacity>

  {/* Amount → opens Amount modal */}
  <TouchableOpacity
    style={[styles.filterButton, activeFilter === 'Amount' && styles.filterButtonActive]}
    onPress={() => {
      setActiveFilter('Amount');
      setShowAmountFilter(true); // 👈 open amount filter modal
    }}
  >
    <Text style={[styles.filterText, activeFilter === 'Amount' && styles.filterTextActive]}>
      💰 Amount {(amountRange.min || amountRange.max) ? '✓' : ''}
    </Text>
  </TouchableOpacity>
</ScrollView>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search by Customer Name or Bill ID"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />

      </View>

      {/* Bill History */}
      <View style={styles.billSection}>
        <Text style={styles.sectionTitle}>Bill History</Text>
        <ScrollView style={styles.billList}>
          {processedBills.length > 0 ? (
            processedBills.map((bill) => {
              const status = bill.amountPaid >= bill.total ? 'Paid' : 'Pending';
              const navigationBill = {
                id: bill._id,
                customerName: bill.customer?.name || 'Unknown',
                customeradress: bill.customer?.address || 'N/A',
                amount: bill.subtotal,
                status: status as 'Paid' | 'Pending',
                date: new Date(bill.createdAt).toLocaleDateString(),
                paymentMethod: bill.paymentMethod,
                advanceAmount: bill.amountPaid,
                pendingAmount: Math.max(0, bill.total - bill.amountPaid),
                items: bill?.items[0]?.productId ? bill.items : [],

                discount: bill.discount || 0,
                subTotal: bill.subtotal
              };
              return (
                <TouchableOpacity
                  key={bill._id}
                  style={styles.billItem}
                  onPress={() => navigation.navigate('SalesDetail', { bill: navigationBill })}
                >
                  <View style={styles.billHeader}>
                    <Text style={styles.billId}>Bill #{bill.billNumber}</Text>
                    <Text style={styles.billDate}>{new Date(bill.createdAt).toLocaleDateString()}</Text>
                  </View>

                  <View style={styles.billContent}>
                    <View>
                      <Text style={styles.customerName}>{bill.customer?.name || 'Unknown'}</Text>
                      <View style={styles.badgeContainer}>
                        <View style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
                          <Text style={getStatusTextStyle(status)}>
                            {getStatusEmoji(status)} {status}
                          </Text>
                        </View>
                        <View style={[styles.paymentBadge, bill.paymentMethod === 'Cash' ? styles.cashBadge : styles.onlineBadge]}>
                          <Text style={bill.paymentMethod === 'Cash' ? styles.cashText : styles.onlineText}>
                            {bill.paymentMethod === 'Cash' ? '💵' : '💳'} {bill.paymentMethod}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.amount}>₹{bill.subtotal.toFixed(2)}</Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.viewDetails}
                    onPress={() => navigation.navigate('SalesDetail', { bill: navigationBill })}
                  >
                    <Text style={styles.viewDetailsText}>View Details 👉</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResults}>No bills found 😕</Text>
              <Text style={styles.noResultsSubtext}>Try adjusting your filters or search query</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Status Filter Modal */}
      <Modal visible={showStatusFilter} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            
            {['Paid', 'Pending'].map(status => (
              <TouchableOpacity
                key={status}
                style={styles.checkboxItem}
                onPress={() => toggleStatusFilter(status)}
              >
                <View style={styles.checkbox}>
                  {selectedStatuses.includes(status) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  {getStatusEmoji(status)} {status}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowStatusFilter(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Amount Filter Modal */}
      <Modal visible={showAmountFilter} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Amount Range</Text>
            
            <Text style={styles.inputLabel}>Minimum Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0"
              value={amountRange.min}
              onChangeText={(text) => setAmountRange(prev => ({ ...prev, min: text }))}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Maximum Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="No limit"
              value={amountRange.max}
              onChangeText={(text) => setAmountRange(prev => ({ ...prev, max: text }))}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearModalButton]}
                onPress={() => setAmountRange({ min: '', max: '' })}
              >
                <Text style={styles.clearModalButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowAmountFilter(false)}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Range Filter Modal */}
      <Modal visible={showDateFilter} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Date Range</Text>
            
            <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="2024-07-01"
              value={dateRange.start}
              onChangeText={(text) => setDateRange(prev => ({ ...prev, start: text }))}
            />

            <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="2024-07-31"
              value={dateRange.end}
              onChangeText={(text) => setDateRange(prev => ({ ...prev, end: text }))}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearModalButton]}
                onPress={() => setDateRange({ start: '', end: '' })}
              >
                <Text style={styles.clearModalButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowDateFilter(false)}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Method Filter Modal */}
      <Modal visible={showPaymentFilter} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Payment Method</Text>
            
            {['Cash', 'Online'].map(method => (
              <TouchableOpacity
                key={method}
                style={styles.checkboxItem}
                onPress={() => {
                  setSelectedPaymentMethods(prev => 
                    prev.includes(method) 
                      ? prev.filter(m => m !== method)
                      : [...prev, method]
                  );
                }}
              >
                <View style={styles.checkbox}>
                  {selectedPaymentMethods.includes(method) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  {method === 'Cash' ? '💵' : '💳'} {method}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowPaymentFilter(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  resultsCount: { fontSize: 14, color: '#666666', textAlign: 'center', marginTop: 4 },
  
  filterSection: { padding: 16, backgroundColor: '#F9F9F9' },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  filterTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  clearButton: { padding: 4,  },
  clearButtonText: { color: '#FF4444', fontSize: 15, fontWeight: '900'  },
  
  searchInput: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  
  subFilterTitle: { fontSize: 14, fontWeight: '600', color: '#666666', marginBottom: 8 },
  
  filterScroll: { flexDirection: 'row', marginBottom: 16 },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterButtonActive: { backgroundColor: '#0066FF', borderColor: '#0066FF' },
  filterText: { fontSize: 14, fontWeight: '700', color: '#666666' },
  filterTextActive: { color: '#FFFFFF' },
  
  advancedFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  advancedFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  activeAdvancedFilter: { backgroundColor: '#E8F4FD', borderColor: '#0066FF' },
  advancedFilterText: { fontSize: 12, fontWeight: '600', color: '#666666' },
  
  billSection: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 24, fontWeight: '600', color: '#1A1A1A', marginBottom: 16 },
  billList: { flex: 1 },
  billItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  billHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billId: { fontSize: 16, color: '#666666', fontWeight: '500' },
  billDate: { fontSize: 14, color: '#666666' },
  billContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  customerName: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  paidBadge: { backgroundColor: '#E8F5E9' },
  pendingBadge: { backgroundColor: '#FFF3E0' },
  cashBadge: { backgroundColor: '#E3F2FD' },
  onlineBadge: { backgroundColor: '#E8F5E9' },
  paidText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  pendingText: { fontSize: 12, fontWeight: '600', color: '#EF6C00' },
  cashText: { fontSize: 12, fontWeight: '600', color: '#1565C0' },
  onlineText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  badgeContainer: { flexDirection: 'row', gap: 8 },
  paymentBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  amount: { fontSize: 18, fontWeight: '700', color: '#0066FF' },
  viewDetails: { alignSelf: 'flex-end' },
  viewDetailsText: { color: '#0066FF', fontSize: 14, fontWeight: '600' },
  
  noResultsContainer: { alignItems: 'center', marginTop: 40 },
  noResults: { textAlign: 'center', color: '#999999', fontSize: 18, fontWeight: '600' },
  noResultsSubtext: { textAlign: 'center', color: '#CCCCCC', fontSize: 14, marginTop: 8 },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 20, textAlign: 'center' },
  
  checkboxItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#0066FF',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#0066FF', fontWeight: 'bold' },
  checkboxLabel: { fontSize: 16, color: '#1A1A1A' },
  
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#666666', marginBottom: 8, marginTop: 12 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  modalButton: {
    flex: 1,
    backgroundColor: '#0066FF',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  modalButtonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  clearModalButton: { backgroundColor: '#F5F5F5' },
  clearModalButtonText: { color: '#666666', textAlign: 'center', fontWeight: '600', fontSize: 16 },
});