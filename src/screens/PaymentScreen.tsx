import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import {  NativeStackScreenProps } from '@react-navigation/native-stack';
import { BillingStackParamList } from '../navigation/BillingStack';

type PaymentScreenProp = NativeStackScreenProps<BillingStackParamList, "PaymentScreen">;

export default function PaymentScreen({navigation}:PaymentScreenProp) {

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <View style={styles.content}>
        {/* Amount Section */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Final Payable Amount</Text>
          <Text style={styles.amount}>₹ 100</Text>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Scan to Pay 📱</Text>
          <View style={styles.qrContainer}>
            {/* Replace with actual QR code implementation */}
            {/* <View style={styles.qrCode}>
              <Image 
                source={require('../assets/qr-placeholder.png')}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View> */}
          </View>
          <Text style={styles.qrHelper}>
            Please ask the customer to scan this QR code 🔍
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.paidButton]}
            onPress={() => {/* Handle marking as paid */}}
          >
            <Text style={styles.buttonText}>✅ Mark as Paid</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.pendingButton]}
            onPress={() => {/* Handle marking as pending */}}
          >
            <Text style={[styles.buttonText, styles.pendingButtonText]}>
              ⏳ Mark as Pending
            </Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0066FF',
    letterSpacing: -1,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrHelper: {
    marginTop: 16,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  actionButtons: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  paidButton: {
    backgroundColor: '#0066FF',
  },
  pendingButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pendingButtonText: {
    color: '#666666',
  },
});

