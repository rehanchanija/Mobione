import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import * as RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { useAuth } from '../hooks/useAuth';

interface SalesDetailScreenProps {
  route: {
    params: {
      bill: {
        id: string;
        billNumber?: string;
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
        customerPhone?: string;
        subTotal?: number;
      };
    };
  };
}

const shop = {
  name: 'Fashion Store',
  address: '123, Market Street, City',
  owner: 'John Doe',
  phone: '+91 9876543210',
};

export default function SalesDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { bill } = route.params as SalesDetailScreenProps['route']['params'];
  const { profile } = useAuth();

  // Amount calculations
  const subtotal = bill.subTotal || bill.amount + (bill.pendingAmount || 0);
  const discount = bill.discount || 0;
  const afterDiscount = subtotal - discount;
  const advanceAmount = bill.advanceAmount || 0;
  const finalAmount = afterDiscount - advanceAmount;
  const pendingAmount = finalAmount > 0 ? finalAmount : 0;
  const status = pendingAmount <= 0 ? 'Paid' : bill.status;

  const [showSettlementInfo, setShowSettlementInfo] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);

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

  const generatePDF = async (): Promise<string | null> => {
    const itemsHtml = bill.items
      .map((item: any) => {
        const name = item?.name ?? item?.product?.name ?? 'Unknown Product';
        const qty = item?.quantity ?? 0;
        const price = item?.price ?? 0;
        return `<li>${name} - ${qty} x ₹${price}</li>`;
      })
      .join('');

    const html = `
      <h1>Bill: ${bill.id}</h1>
      <p>Customer: ${bill.customerName}</p>
      <p>Date: ${bill.date}</p>
      <p>Total Amount: ₹${subtotal.toFixed(2)}</p>
      <p>Status: ${status}</p>
      <h3>Items</h3>
      <ul>
        ${itemsHtml}
      </ul>
    `;

    const options = {
      html,
      fileName: `Bill_${bill.id}`,
      directory: 'Documents',
    };

    const file = await (RNHTMLtoPDF as any).convert(options);
    const path = file?.filePath || null;
    setPdfPath(path);
    return path;
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sale Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Bill Card */}
        <View style={styles.card}>
          {/* Bill Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bill Number:</Text>
              <Text style={styles.infoValue}>{bill.billNumber || bill.id}</Text>
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

          {/* Customer Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{bill.customerName}</Text>
            </View>
            {bill.customeradress && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{bill.customeradress}</Text>
              </View>
            )}
            {bill.customerPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{bill.customerPhone}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Items Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items Purchased</Text>
            <View style={styles.itemsHeader}>
              <Text style={[styles.itemHeaderText, { flex: 2 }]}>Product</Text>
              <Text style={[styles.itemHeaderText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.itemHeaderText, { flex: 1, textAlign: 'right' }]}>Price</Text>
            </View>
            {bill.items && bill.items.length > 0 ? (
              bill.items.map((item: any, index: number) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={[styles.itemText, { flex: 2 }]}>
                    {item?.name ?? item?.product?.name ?? 'Unknown Product'}
                  </Text>
                  <Text style={[styles.itemText, { flex: 1, textAlign: 'center' }]}>
                    {item.quantity}
                  </Text>
                  <Text style={[styles.itemText, { flex: 1, textAlign: 'right' }]}>
                    ₹{item.price}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>No items found</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Payment Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={[styles.infoRow, styles.paymentRow]}>
              <Text style={styles.paymentLabel}>Total Amount</Text>
              <Text style={styles.totalAmountValue}>₹{subtotal.toFixed(2)}</Text>
            </View>
            {discount > 0 && (
              <View style={[styles.infoRow, styles.paymentRow]}>
                <Text style={styles.paymentLabel}>Discount</Text>
                <Text style={styles.discountValue}>
                  -₹{discount.toFixed(2)} ({((discount / subtotal) * 100).toFixed(0)}%)
                </Text>
              </View>
            )}
            <View style={[styles.infoRow, styles.paymentRow]}>
              <Text style={styles.paymentLabel}>Amount Payable</Text>
              <Text style={styles.amountValue}>₹{afterDiscount.toFixed(2)}</Text>
            </View>
            <View style={[styles.infoRow, styles.paymentRow]}>
              <Text style={styles.paymentLabel}>Amount Paid</Text>
              <Text style={styles.advanceValue}>₹{advanceAmount.toFixed(2)}</Text>
            </View>
            {pendingAmount > 0 && (
              <View style={[styles.infoRow, styles.paymentRow]}>
                <Text style={styles.paymentLabel}>Amount Due</Text>
                <Text style={styles.pendingValue}>₹{pendingAmount.toFixed(2)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowPdfModal(true)}
          >
            <Text style={styles.actionButtonText}>Print Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              status === 'Pending' ? styles.primaryButton : styles.disabledButton,
            ]}
            disabled={status !== 'Pending'}
            onPress={handleMarkAsPaid}
          >
            <Text
              style={[
                styles.actionButtonText,
                status === 'Pending'
                  ? styles.primaryButtonText
                  : styles.disabledButtonText,
              ]}
            >
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
          </View>
        </View>
      )}

      {/* Receipt Modal */}
      <Modal
        visible={showPdfModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPdfModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView style={{ maxHeight: 400 }}>
              <View style={styles.receiptCard}>
                {/* Shop Info */}
                <Text style={styles.shopName}>{profile?.shopName || shop.name}</Text>
                <Text style={styles.shopDetails}>Owner: {profile?.name || shop.owner}</Text>
                {profile?.phone && <Text style={styles.shopDetails}>Phone: {profile.phone}</Text>}
                {profile?.shopDetails && <Text style={styles.shopDetails}>{profile.shopDetails}</Text>}
                
                <View style={styles.divider} />

                {/* Bill Info */}
                <Text style={styles.sectionTitle}>Bill Information</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Bill No:</Text>
                  <Text style={styles.value}>{bill.billNumber || bill.id}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>{bill.date}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Customer:</Text>
                  <Text style={styles.value}>{bill.customerName}</Text>
                </View>
                {bill.customerPhone && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Phone:</Text>
                    <Text style={styles.value}>{bill.customerPhone}</Text>
                  </View>
                )}
                <View style={styles.row}>
                  <Text style={styles.label}>Payment:</Text>
                  <Text style={styles.value}>{bill.paymentMethod}</Text>
                </View>

                <View style={styles.divider} />

                {/* Items */}
                <Text style={styles.sectionTitle}>Items Purchased</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableText, { flex: 2 }]}>Product</Text>
                  <Text style={[styles.tableText, { flex: 1, textAlign: "center" }]}>
                    Qty
                  </Text>
                  <Text style={[styles.tableText, { flex: 1, textAlign: "right" }]}>
                    Price
                  </Text>
                </View>
                {bill.items.map((item: any, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableValue, { flex: 2 }]}>{item?.name ?? item?.product?.name ?? 'Unknown Product'}</Text>
                    <Text style={[styles.tableValue, { flex: 1, textAlign: "center" }]}>
                      {item.quantity}
                    </Text>
                    <Text style={[styles.tableValue, { flex: 1, textAlign: "right" }]}>
                      ₹{item.price}
                    </Text>
                  </View>
                ))}

                <View style={styles.divider} />

                {/* Amount Summary */}
                <Text style={styles.sectionTitle}>Amount Summary</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Subtotal:</Text>
                  <Text style={styles.value}>₹{subtotal.toFixed(2)}</Text>
                </View>
                {discount > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Discount:</Text>
                    <Text style={[styles.value, { color: "#D32F2F" }]}>
                      - ₹{discount.toFixed(2)}
                    </Text>
                  </View>
                )}
                 <View style={styles.row}>
                  <Text style={styles.label}>Paid:</Text>
                  <Text style={[styles.value, { color: "#000000ff" }]}>
                    - ₹{advanceAmount.toFixed(2)}
                  </Text>
                </View>
               
                {pendingAmount > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Pending:</Text>
                    <Text style={[styles.value, { color: "#D32F2F" }]}>
                      - ₹{pendingAmount.toFixed(2)}
                    </Text>
                  </View>
                )}
                <View style={styles.divider} />

                <Text style={styles.footerText}>Thank you for shopping with us!</Text>
                <Text style={styles.footerNote}>Visit again ❤️</Text>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.downloadBtn]}
                onPress={async () => {
                  const path = await generatePDF();
                  if (path) {
                    Alert.alert('Downloaded', `PDF saved at ${path}`);
                  } else {
                    Alert.alert('Error', 'Failed to generate PDF');
                  }
                }}
              >
                <Text style={styles.buttonText}>Download PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.shareBtn]}
                onPress={async () => {
                  const path = await generatePDF();
                  if (path) {
                    await Share.open({ url: 'file://' + path });
                  } else {
                    Alert.alert('Error', 'Failed to generate PDF');
                  }
                }}
              >
                <Text style={styles.buttonText}>Share Bill</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{ padding: 12, marginTop: 10 }}
              onPress={() => setShowPdfModal(false)}
            >
              <Text style={{ color: '#0066FF', textAlign: 'center' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  paidText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  pendingText: { fontSize: 12, fontWeight: '600', color: '#EF6C00' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  actionButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#F5F5F5', marginHorizontal: 4, alignItems: 'center' },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  primaryButton: { backgroundColor: '#0066FF' },
  primaryButtonText: { color: '#FFF' },
  disabledButton: { backgroundColor: '#F5F5F5', opacity: 0.5 },
  disabledButtonText: { color: '#999' },
  settlementOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  settlementCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '80%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  settlementTitle: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginBottom: 12, textAlign: 'center' },
  settlementText: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  paymentRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  paymentLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
  totalAmountValue: { fontSize: 16, fontWeight: '700', color: '#1A237E' },
  discountValue: { fontSize: 16, fontWeight: '700', color: '#D32F2F' },
  amountValue: { fontSize: 16, fontWeight: '700', color: '#0066FF' },
  advanceValue: { fontSize: 16, fontWeight: '700', color: '#2E7D32' },
  itemsHeader: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: '#E5E5E5', marginBottom: 8 },
  itemHeaderText: { fontWeight: '700', fontSize: 13, color: '#1A1A1A' },
  itemRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'center' },
  itemText: { fontSize: 13, color: '#333', fontWeight: '500' },
  noItemsText: { fontSize: 14, color: '#999', textAlign: 'center', marginVertical: 12, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
modalCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, width: '90%', maxHeight: '90%' },
receiptCard: { padding: 16 },
shopName: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
shopDetails: { fontSize: 12, textAlign: 'center', color: '#666' },
row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
label: { fontWeight: '600', color: '#333' },
value: { fontWeight: '600', color: '#1A1A1A' },
tableHeader: { flexDirection: 'row', marginTop: 8, borderBottomWidth: 1, borderBottomColor: '#E5E5E5', paddingBottom: 4 },
tableText: { fontWeight: '700', fontSize: 12 },
tableRow: { flexDirection: 'row', marginVertical: 2 },
tableValue: { fontSize: 12 },
totalLabel: { fontWeight: '700', fontSize: 14 },
totalValue: { fontWeight: '700', fontSize: 14 },
footerText: { textAlign: 'center', marginTop: 12, fontWeight: '600' },
footerNote: { textAlign: 'center', fontSize: 12, color: '#666' },
buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
button: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
downloadBtn: { backgroundColor: '#0066FF' },
shareBtn: { backgroundColor: '#2E7D32' },
buttonText: { color: '#FFF', fontWeight: '600' },
  pendingValue: { fontSize: 16, fontWeight: '700', color: '#EF6C00' },

});
 
