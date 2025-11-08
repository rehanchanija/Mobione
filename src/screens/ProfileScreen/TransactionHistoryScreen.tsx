import React from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

// Define minimal Bill type used in this screen
interface Bill {
  _id: string;
  createdAt: string;
  status: 'Paid' | 'Pending';
  customer?: { name?: string };
  items?: { product?: { name?: string }; quantity: number }[];
  paymentMethod: 'Cash' | 'Online';
  total?: number;
}

const TransactionHistoryScreen = () => {
  const navigation = useNavigation<any>();

  const handleBack = () => {
    navigation.goBack();
  };

  // Use bills hook from useAuth instead of direct api
  const { useBills } = useAuth();
  const { data: bills, isLoading, refetch, error } = useBills();

  const renderBill = ({ item }: { item: Bill }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionDate}>{format(new Date(item.createdAt), 'dd MMM yyyy')}</Text>
        <Text
          style={[
            styles.transactionStatus,
            item.status === 'Paid' ? styles.statusCompleted : styles.statusPending,
          ]}
        >
          {item.status}
        </Text>
      </View>

      {/* Customer Name */}
      <Text style={styles.customerName}>{item.customer?.name || 'Unknown Customer'}</Text>

      {/* Items */}
      <View style={{ marginBottom: 8 }}>
        {item.items?.map((it, idx) => (
          <Text key={`${item._id}-it-${idx}`} style={{ color: '#374151' }}>
            {it.product?.name || 'Unknown Product'} x {it.quantity}
          </Text>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.transactionFooter}>
        <Text style={styles.transactionType}>{item.paymentMethod}</Text>
        <Text style={styles.transactionAmount}>₹{(item.total ?? 0).toFixed(2)}</Text>
      </View>
    </View>
  );

  if (isLoading && !bills) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={styles.container}>
          <View style={[styles.transactionCard, { alignItems: 'center' }]}>
            <Text style={{ color: '#B91C1C', fontWeight: '700', marginBottom: 8 }}>Failed to load data</Text>
            <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 12 }}>
              Please ensure you are logged in and the server is reachable.
            </Text>
            <TouchableOpacity onPress={() => refetch()} style={[styles.backButton, { width: 120 }]}>
              <Text style={styles.backArrow}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View> 
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Transaction History</Text>
        </View>
      </View>

      {(!bills || bills.length === 0) ? (
        <View style={[styles.container, { alignItems: 'center' }]}>
          <View style={[styles.transactionCard, { width: '100%', alignItems: 'center' }]}>
            <Text style={{ color: '#6B7280' }}>No bills found.</Text>
            <Text style={{ color: '#6B7280' }}>Create a bill to see it here.</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={bills || []}
          renderItem={renderBill}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={!!isLoading} onRefresh={refetch} />}
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
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 15,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: '#374151',
    fontWeight: 'bold',
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
  container: {
    padding: 24,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  statusCompleted: {
    backgroundColor: '#DEF7EC',
    color: '#03543F',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionType: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
});

export default TransactionHistoryScreen