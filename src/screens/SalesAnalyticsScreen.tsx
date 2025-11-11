import React, { useState, useMemo } from 'react';
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
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Fetch bills with pagination
  const { data: billsResponse, isLoading: isLoadingBills, refetch } = useBills(currentPage, pageSize);

  useFocusEffect(
    React.useCallback(() => {
      // Reset to first page on screen focus
      setCurrentPage(1);
      setAllBills([]);
      refetch();
    }, [refetch])
  );
  
  // Extract bills from paginated response
  const bills = billsResponse?.bills || [];
  const totalPages = billsResponse?.totalPages || 1;
  
  // Update allBills when new data comes in
  React.useEffect(() => {
    if (bills && bills.length > 0) {
      if (currentPage === 1) {
        // First page - replace all data
        setAllBills(bills);
      } else {
        // Subsequent pages - append data
        setAllBills(prevBills => {
          const existingIds = new Set(prevBills.map((b: Bill) => b._id));
          const newBills = bills.filter((b: Bill) => !existingIds.has(b._id));
          return [...prevBills, ...newBills];
        });
      }
      setIsLoadingMore(false);
    }
  }, [bills, currentPage]);
  
  // Transform bills data to include status
  const transformedBills = useMemo(() => {
    if (!allBills) return [];
    
    return allBills.map((bill: Bill) => {
      const subtotal = bill.subtotal || bill.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...bill,
        subtotal,
        status: bill.amountPaid >= bill.total ? 'Paid' as const : 'Pending' as const,
        customerName: bill.customer?.name || 'Unknown',
      };
    });
  }, [allBills]);
  
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
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Paid', 'Pending']);
  const [showAmountFilter, setShowAmountFilter] = useState(false);
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
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

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(bill => {
        const billDate = new Date(bill.createdAt);
        const matchesStartDate = !startDate || billDate >= startDate;
        const matchesEndDate = !endDate || billDate <= endDate;
        return matchesStartDate && matchesEndDate;
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
  }, [activeFilter, searchQuery, selectedStatuses, amountRange, startDate, endDate, selectedPaymentMethods, billsData]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatuses(['Paid', 'Pending']);
    setAmountRange({ min: '', max: '' });
    setStartDate(null);
    setEndDate(null);
    setSelectedPaymentMethods(['Cash', 'Online']);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedStatuses.length < 2) count++;
    if (selectedPaymentMethods.length < 2) count++;
    if (amountRange.min || amountRange.max) count++;
    if (startDate || endDate) count++;
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
  {/* Date → opens Date picker */}
  <TouchableOpacity
    style={[styles.filterButton, activeFilter === 'Date' && styles.filterButtonActive]}
    onPress={() => {
      setActiveFilter('Date');
      setShowStartPicker(true);
    }}
  >
    <Text style={[styles.filterText, activeFilter === 'Date' && styles.filterTextActive]}>
      📅 Date {(startDate || endDate) ? '✓' : ''}
    </Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.filterButton, activeFilter === 'Status' && styles.filterButtonActive]}
    onPress={() => {
      if (selectedStatuses.length === 2) {
        setSelectedStatuses(['Paid']);
      } else if (selectedStatuses.includes('Paid')) {
        setSelectedStatuses(['Pending']);
      } else {
        setSelectedStatuses(['Paid', 'Pending']);
      }
      setActiveFilter('Status');
    }}
  >
    <Text style={[styles.filterText, activeFilter === 'Status' && styles.filterTextActive]}>
      🔄 {selectedStatuses.length === 2 ? 'All Status' : selectedStatuses[0]}
    </Text>
  </TouchableOpacity>

  {/* Payment Method → toggle on tap */}
  <TouchableOpacity
    style={[styles.filterButton, activeFilter === 'Payment' && styles.filterButtonActive]}
    onPress={() => {
      if (selectedPaymentMethods.length === 2) {
        setSelectedPaymentMethods(['Cash']);
      } else if (selectedPaymentMethods.includes('Cash')) {
        setSelectedPaymentMethods(['Online']);
      } else {
        setSelectedPaymentMethods(['Cash', 'Online']);
      }
      setActiveFilter('Payment');
    }}
  >
    <Text style={[styles.filterText, activeFilter === 'Payment' && styles.filterTextActive]}>
      💳 {selectedPaymentMethods.length === 2 ? 'All Payment' : selectedPaymentMethods[0]}
    </Text>
  </TouchableOpacity>

  {/* Amount → opens Amount modal */}
  <TouchableOpacity
    style={[styles.filterButton, activeFilter === 'Amount' && styles.filterButtonActive]}
    onPress={() => {
      setActiveFilter('Amount');
      setShowAmountFilter(true);
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

      {/* Bill History */}
      <View style={styles.billSection}>
        <Text style={styles.sectionTitle}>Bill History</Text>
        <ScrollView 
          style={styles.billList}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
            
            if (isCloseToBottom && !isLoadingMore && currentPage < totalPages) {
              setIsLoadingMore(true);
              setCurrentPage(prev => prev + 1);
            }
          }}
          scrollEventThrottle={16}
        >
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
                items: bill?.items,

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

      {/* Loading indicator for infinite scroll */}
      {isLoadingMore && (
        <View style={styles.loadingMoreContainer}>
          <Text style={styles.loadingMoreText}>Loading more bills...</Text>
        </View>
      )}



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
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  
  billHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  billId: { 
    fontSize: 15, 
    color: '#0066FF', 
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  billDate: { 
    fontSize: 13, 
    color: '#888888',
    fontWeight: '500',
  },
  billContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 14,
  },
  customerName: { 
    fontSize: 19, 
    fontWeight: '700', 
    color: '#1A1A1A', 
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  statusBadge: { 
    borderRadius: 16, 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paidBadge: { backgroundColor: '#D4EDDA', borderWidth: 1, borderColor: '#C3E6CB' },
  pendingBadge: { backgroundColor: '#FFF3CD', borderWidth: 1, borderColor: '#FFE5A1' },
  cashBadge: { backgroundColor: '#D1ECF1', borderWidth: 1, borderColor: '#BEE5EB' },
  onlineBadge: { backgroundColor: '#D4EDDA', borderWidth: 1, borderColor: '#C3E6CB' },
  paidText: { fontSize: 12, fontWeight: '700', color: '#155724' },
  pendingText: { fontSize: 12, fontWeight: '700', color: '#856404' },
  cashText: { fontSize: 12, fontWeight: '700', color: '#0C5460' },
  onlineText: { fontSize: 12, fontWeight: '700', color: '#155724' },
  badgeContainer: { flexDirection: 'row', gap: 6, marginTop: 2 },
  paymentBadge: { 
    borderRadius: 16, 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  amount: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#0066FF',
    letterSpacing: 0.3,
    textAlign: 'right',
  },
  viewDetails: { 
    alignSelf: 'flex-end',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D6E9FF',
  },
  viewDetailsText: { 
    color: '#0066FF', 
    fontSize: 13, 
    fontWeight: '700',
    letterSpacing: 0.2,
  },
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

  // Infinite scroll loading indicator
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },

});