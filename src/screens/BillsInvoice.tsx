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
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  TextInput,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import Share from 'react-native-share';
import { showMessage } from 'react-native-flash-message';
import { useAuth } from '../hooks/useAuth';
import { billsApi } from '../services/api';
import RNFS from 'react-native-fs';
import RNPrint from 'react-native-print';

interface BillsInvoiceProps {
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

export default function BillsInvoice() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { bill } = route.params as BillsInvoiceProps['route']['params'];
  const { profile } = useAuth();

  // Amount calculations
  const subtotal = bill.subTotal || bill.amount + (bill.pendingAmount || 0);
  const discount = bill.discount || 0;
  const afterDiscount = subtotal - discount;
  const advanceAmount = bill.advanceAmount || 0;
  const finalAmount = afterDiscount - advanceAmount;
  const pendingAmount = finalAmount > 0 ? finalAmount : 0;
  const status = pendingAmount <= 0 ? 'Paid' : bill.status;
  const [reminderLanguage, setReminderLanguage] = useState('english');

  const [showSettlementInfo, setShowSettlementInfo] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [isUpdatingBill, setIsUpdatingBill] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

 
  const generateReminderMessage = (language: 'hindi' | 'english') => {
    const due = new Date();
    due.setDate(due.getDate() + 3);
    const dueStr = due.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (language === 'hindi') {
      return `🔔 *भुगतान अनुस्मारक*

प्रिय *${bill.customerName}*,

यह आपके लंबित भुगतान के बारे में एक सौम्य अनुस्मारक है:

📋 *बिल विवरण:*
• बिल नंबर: #${bill.billNumber || bill.id}
• तिथि: ${bill.date}

💰 *भुगतान सारांश:*
• कुल राशि: ₹${subtotal.toFixed(2)}
• दिया गया भुगतान: ₹${advanceAmount.toFixed(2)}
• *बाकी राशि: ₹${pendingAmount.toFixed(2)}*

⏰ *अंतिम तिथि:* ${dueStr}

कृपया शेष भुगतान जल्द से जल्द पूरा करें।

यदि आपके कोई प्रश्न हैं, तो आप बेझिझक हमसे संपर्क कर सकते हैं।

आपके व्यापार के लिए धन्यवाद! 🙏

सादर,
*${profile?.shopName || 'हमारी दुकान'}*
${profile?.phone ? `📞 ${profile.phone}` : ''}`;
    } else {
      return `🔔 *Payment Reminder*

Dear *${bill.customerName}*,

This is a friendly reminder regarding your pending payment:

📋 *Bill Details:*
• Bill No: #${bill.billNumber || bill.id}
• Date: ${bill.date}

💰 *Payment Summary:*
• Total Amount: ₹${subtotal.toFixed(2)}
• Amount Paid: ₹${advanceAmount.toFixed(2)}
• *Pending Amount: ₹${pendingAmount.toFixed(2)}*

⏰ *Due Date:* ${dueStr}

Please clear the pending amount at your earliest convenience.

For any queries, feel free to contact us.

Thank you for your business! 🙏

Best regards,
*${profile?.shopName || 'Our Shop'}*
${profile?.phone ? `📞 ${profile.phone}` : ''}`;
    }
  };

  const openReminderModal = () => {
    const msg = generateReminderMessage('hindi');
    setReminderMessage(msg);
    setReminderLanguage('hindi');
    setShowReminderModal(true);
  };

  const sendWhatsAppReminder = async () => {
    try {
      const text = encodeURIComponent(reminderMessage || '');
      const rawPhone = String(bill.customerPhone || '').replace(/\D/g, '');
      let phone = rawPhone;
      if (/^\d{10}$/.test(rawPhone)) phone = `91${rawPhone}`;
      const waUrlScheme = phone ? `whatsapp://send?phone=${phone}&text=${text}` : `whatsapp://send?text=${text}`;
      const waWebUrl = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
      const canOpen = await Linking.canOpenURL('whatsapp://send');
      if (canOpen) {
        await Linking.openURL(waUrlScheme);
      } else {
        await Linking.openURL(waWebUrl);
      }
      setShowReminderModal(false);
      showMessage({ message: 'Opening WhatsApp', type: 'info' });
    } catch (e) {
      // Error suppressed
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      setIsUpdatingBill(true);
      
      const newAdvanceAmount = advanceAmount + pendingAmount;
      
      const updateData = {
        status: 'Paid',
        amountPaid: newAdvanceAmount,
      };
      
      console.log('🔄 Updating bill as paid...');
      await billsApi.update(bill.id, updateData);
      console.log('✅ Bill updated');

      setShowSettlementInfo(true);
      
      setTimeout(() => {
        setIsUpdatingBill(false);
        setShowSettlementInfo(false);
        navigation.navigate('BillHistory', { refreshBills: true });
      }, 2000);
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      setIsUpdatingBill(false);
    }
  };

  // const handleDelete = async () => {
  //   try {
  //     await billsApi.delete(bill.id);
  //     showMessage({ message: 'Bill deleted successfully', type: 'success' });
  //     navigation.navigate('BillHistory', { refreshBills: true });
  //   } catch (error) {
  //     console.error('Error deleting bill:', error);
  //     Alert.alert('Error', 'Failed to delete bill. Please try again.');
  //   }
  // };

  // Request storage permissions
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        return true;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'This app needs access to your storage to save PDF files',
          buttonPositive: 'OK',
        }
      );
      
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  const generatePDF = async (): Promise<string | null> => {
    try {
      setIsGeneratingPdf(true);
      console.log('🔄 Starting PDF generation...');

      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        setIsGeneratingPdf(false);
        return null;
      }

      const itemsHtml = bill.items
        .map((item: any, index: number) => {
          const name = item?.name ?? item?.product?.name ?? 'Unknown Product';
          const qty = item?.quantity ?? 0;
          const price = item?.price ?? 0;
          const total = qty * price;
          return `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${index + 1}. ${name}</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e5e5;">${qty}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e5e5;">₹${price.toFixed(2)}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e5e5; font-weight: 600;">₹${total.toFixed(2)}</td>
            </tr>
          `;
        })
        .join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              background: #fff;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              border: 3px solid #0066FF;
              border-radius: 10px;
              padding: 30px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #0066FF;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .shop-name {
              font-size: 32px;
              font-weight: bold;
              color: #0066FF;
              margin-bottom: 10px;
              letter-spacing: 2px;
            }
            .shop-details {
              font-size: 14px;
              color: #666;
              margin: 5px 0;
            }
            .section {
              margin: 25px 0;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #0066FF;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #E5E5E5;
              text-transform: uppercase;
            }
            .info-table {
              width: 100%;
              margin: 15px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .info-label {
              font-weight: 600;
              color: #666;
            }
            .info-value {
              font-weight: 600;
              color: #1A1A1A;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
            .status-paid {
              background: #E8F5E9;
              color: #2E7D32;
            }
            .status-pending {
              background: #FFF3E0;
              color: #EF6C00;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: #F5F5F5;
              padding: 12px;
              text-align: left;
              font-weight: 700;
              border-bottom: 2px solid #0066FF;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #e5e5e5;
            }
            .amount-section {
              background: #F8F9FA;
              padding: 20px;
              border-radius: 10px;
              margin: 25px 0;
              border: 2px solid #0066FF;
            }
            .amount-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 15px;
            }
            .amount-row.total {
              border-top: 2px solid #0066FF;
              margin-top: 10px;
              padding-top: 15px;
              font-size: 20px;
              font-weight: bold;
              color: #0066FF;
            }
            .discount { color: #D32F2F; font-weight: 600; }
            .paid { color: #2E7D32; font-weight: 600; }
            .pending { color: #EF6C00; font-weight: 600; }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px dashed #E5E5E5;
            }
            .footer-text {
              font-size: 18px;
              font-weight: 600;
              color: #0066FF;
              margin-bottom: 10px;
            }
            .footer-note {
              font-size: 14px;
              color: #666;
              font-style: italic;
            }
            .divider {
              height: 2px;
              background: #E5E5E5;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="shop-name">${profile?.shopName || shop.name}</div>
              <div class="shop-details">Owner: ${profile?.name || shop.owner}</div>
              ${profile?.phone ? `<div class="shop-details">Phone: ${profile.phone}</div>` : ''}
              ${profile?.shopDetails ? `<div class="shop-details">${profile.shopDetails}</div>` : ''}
            </div>

            <div class="section">
              <div class="section-title">📋 Bill Information</div>
              <div class="info-table">
                <div class="info-row">
                  <span class="info-label">Bill Number:</span>
                  <span class="info-value">#${bill.billNumber || bill.id}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${bill.date}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span class="status-badge ${status === 'Paid' ? 'status-paid' : 'status-pending'}">
                    ${status === 'Paid' ? '✅' : '⏳'} ${status}
                  </span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">👤 Customer Information</div>
              <div class="info-table">
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${bill.customerName}</span>
                </div>
                ${bill.customerPhone ? `
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${bill.customerPhone}</span>
                </div>
                ` : ''}
                ${bill.customeradress ? `
                <div class="info-row">
                  <span class="info-label">Address:</span>
                  <span class="info-value">${bill.customeradress}</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="info-label">Payment Method:</span>
                  <span class="info-value">${bill.paymentMethod === 'Cash' ? '💵' : '💳'} ${bill.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">🛍️ Items Purchased</div>
              <table>
                <thead>
                  <tr>
                    <th style="text-align: left;">Product</th>
                    <th style="text-align: center; width: 80px;">Qty</th>
                    <th style="text-align: right; width: 100px;">Price</th>
                    <th style="text-align: right; width: 120px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div class="amount-section">
              <div class="section-title">💰 Amount Summary</div>
              <div class="amount-row">
                <span>Subtotal:</span>
                <span>₹${subtotal.toFixed(2)}</span>
              </div>
              ${discount > 0 ? `
              <div class="amount-row discount">
                <span>Discount (${((discount / subtotal) * 100).toFixed(0)}%):</span>
                <span>- ₹${discount.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="amount-row">
                <span><strong>Amount Payable:</strong></span>
                <span><strong>₹${afterDiscount.toFixed(2)}</strong></span>
              </div>
              <div style="height: 1px; background: #E5E5E5; margin: 10px 0;"></div>
              <div class="amount-row paid">
                <span>Amount Paid:</span>
                <span>₹${advanceAmount.toFixed(2)}</span>
              </div>
              ${pendingAmount > 0 ? `
              <div class="amount-row pending">
                <span>Amount Due:</span>
                <span>₹${pendingAmount.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="amount-row total">
                <span>Final Amount:</span>
                <span>₹${(afterDiscount - advanceAmount).toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              <div class="footer-text">🙏 Thank you for shopping with us!</div>
              <div class="footer-note">Visit again ❤️</div>
              <div class="footer-note" style="margin-top: 10px;">Generated: ${new Date().toLocaleString()}</div>
            </div>
          </div>
        </body>
        </html>
      `;

      const fileName = `Bill_${bill.billNumber || bill.id}_${Date.now()}.pdf`;
      
      if (Platform.OS === 'android') {
        const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        
        await RNPrint.print({
          html,
        });

        console.log('✅ PDF printed successfully');
        setIsGeneratingPdf(false);
        return filePath;
      } else {
        await RNPrint.print({ html });
        setIsGeneratingPdf(false);
        return 'PDF Printed';
      }
    } catch (error: any) {
      console.error('❌ PDF Generation Error:', error);
      setIsGeneratingPdf(false);
      return null;
    }
  };

  const handleShare = async () => {
    const path = await generatePDF();
    if (path) {
      try {
        await Share.open({ 
          url: Platform.OS === 'ios' ? path : 'file://' + path,
          type: 'application/pdf',
          title: `Bill #${bill.billNumber || bill.id}`,
        });
      } catch (error: any) {
        if (error.message !== 'User did not share') {
          console.error('Share error:', error);
        }
      }
    }
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
        
        {/* Action Icons */}
        <View style={styles.actionIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {/* Navigate to edit screen */}}
          >
            <Text style={styles.iconText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowDeleteConfirm(true)}
          >
            <Text style={styles.iconText}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleShare}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <ActivityIndicator size="small" color="#0066FF" />
            ) : (
              <Text style={styles.iconText}>📤</Text>
            )}
          </TouchableOpacity>
        </View>
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
              {status === 'Pending' ? (
                <TouchableOpacity onPress={openReminderModal} style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
                  <Text style={getStatusTextStyle(status)}>
                    {getStatusEmoji(status)} {status}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
                  <Text style={getStatusTextStyle(status)}>
                    {getStatusEmoji(status)} {status}
                  </Text>
                </View>
              )}
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
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomActionContainer}>
        <TouchableOpacity
          style={[
            styles.bottomActionButton,
            status === 'Pending' ? styles.paidButtonActive : styles.paidButtonDisabled,
          ]}
          disabled={status !== 'Pending' || isUpdatingBill}
          onPress={handleMarkAsPaid}
        >
          {isUpdatingBill ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.bottomActionText}>
              {status === 'Pending' ? '✅ Mark as Paid' : '✓ Paid'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Settlement Info Overlay */}
      {showSettlementInfo && (
        <View style={styles.settlementOverlay}>
          <View style={styles.settlementCard}>
            <Text style={styles.settlementTitle}>Payment Complete! ✅</Text>
            <Text style={styles.settlementText}>All settlement has been paid</Text>
          </View>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteConfirmCard}>
            <Text style={styles.deleteTitle}>Delete Bill?</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete this bill? This action cannot be undone.
            </Text>
            <View style={styles.deleteButtonRow}>
              <TouchableOpacity
                style={[styles.deleteButton, styles.cancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, styles.confirmDeleteButton]}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  // handleDelete();
                }}
              >
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pending Reminder Modal */}
      <Modal
        visible={showReminderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReminderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💬 WhatsApp Reminder</Text>
              <TouchableOpacity onPress={() => setShowReminderModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400, padding: 16 }}>
              <View style={styles.langToggle}>
                <TouchableOpacity
                  style={[styles.langBtn, reminderLanguage === 'english' && styles.langBtnActive]}
                  onPress={() => {
                    setReminderLanguage('english');
                    setReminderMessage(generateReminderMessage('english'));
                  }}
                >
                  <Text style={[styles.langBtnText, reminderLanguage === 'english' && styles.langBtnTextActive]}>English</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langBtn, reminderLanguage === 'hindi' && styles.langBtnActive]}
                  onPress={() => {
                    setReminderLanguage('hindi');
                    setReminderMessage(generateReminderMessage('hindi'));
                  }}
                >
                  <Text style={[styles.langBtnText, reminderLanguage === 'hindi' && styles.langBtnTextActive]}>हिंदी</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontWeight: '700', marginBottom: 8 }}>Message</Text>
              <TextInput
                style={styles.reminderInput}
                value={reminderMessage}
                onChangeText={setReminderMessage}
                multiline
                numberOfLines={8}
                placeholder="Type your reminder message"
                textAlignVertical="top"
              />
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: '#6B7280' }}>Will be sent to: {bill.customerPhone || 'No phone number'}</Text>
              </View>
            </ScrollView>
            <View style={styles.reminderButtonRow}>
              <TouchableOpacity style={[styles.reminderBtn, { backgroundColor: '#F3F4F6' }]} onPress={() => setShowReminderModal(false)}>
                <Text style={{ fontWeight: '700', color: '#374151' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.reminderBtn, styles.reminderPrimary]} onPress={sendWhatsAppReminder}>
                <Text style={{ fontWeight: '700', color: '#FFF' }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: { padding: 8, minWidth: 60 },
  backButtonText: { fontSize: 16, color: '#0066FF', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', flex: 1, textAlign: 'center' },
  actionIcons: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  iconText: {
    fontSize: 18,
  },
  content: { flex: 1, padding: 16 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E5E5', marginVertical: 16 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  paidBadge: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#C3E6CB' },
  pendingBadge: { backgroundColor: '#FFF3E0', borderWidth: 1, borderColor: '#FFE5A1' },
  paidText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
  pendingText: { fontSize: 12, fontWeight: '700', color: '#EF6C00' },
  settlementOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1000 
  },
  settlementCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 24, 
    width: '80%', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 8 
  },
  settlementTitle: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginBottom: 12, textAlign: 'center' },
  settlementText: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  paymentRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  paymentLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
  totalAmountValue: { fontSize: 16, fontWeight: '700', color: '#1A237E' },
  discountValue: { fontSize: 16, fontWeight: '700', color: '#D32F2F' },
  amountValue: { fontSize: 16, fontWeight: '700', color: '#0066FF' },
  advanceValue: { fontSize: 16, fontWeight: '700', color: '#2E7D32' },
  itemsHeader: { 
    flexDirection: 'row', 
    paddingVertical: 10, 
    borderBottomWidth: 2, 
    borderBottomColor: '#0066FF', 
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  itemHeaderText: { fontWeight: '700', fontSize: 13, color: '#1A1A1A' },
  itemRow: { 
    flexDirection: 'row', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0', 
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  itemText: { fontSize: 13, color: '#333', fontWeight: '500' },
  noItemsText: { fontSize: 14, color: '#999', textAlign: 'center', marginVertical: 12, fontStyle: 'italic' },
  pendingValue: { fontSize: 16, fontWeight: '700', color: '#EF6C00' },
  
  // Bottom Action Button
  bottomActionContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bottomActionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  paidButtonActive: {
    backgroundColor: '#0066FF',
  },
  paidButtonDisabled: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C3E6CB',
  },
  bottomActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  
  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  modalCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    width: '100%', 
    maxHeight: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#0066FF',
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#0066FF',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  
  // Delete Confirmation Modal
  deleteConfirmCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  deleteTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  deleteButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 15,
  },
  confirmDeleteButton: {
    backgroundColor: '#FF4444',
  },
  confirmDeleteText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  
  reminderInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 140,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  reminderButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  reminderBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  reminderPrimary: { backgroundColor: '#22C55E' },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  langBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  langBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  langBtnTextActive: {
    color: '#4F46E5',
  },
});