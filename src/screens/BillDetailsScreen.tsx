import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BillingStackParamList } from "../navigation/BillingStack";
import { billsApi, customersApi } from "../services/api";

type BillDetailsProps = NativeStackScreenProps<BillingStackParamList, "BillDetails">;

export default function BillDetailsScreen({ navigation, route }: BillDetailsProps) {
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountAmount, setDiscountAmount] = useState("0");

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const items = route.params?.items || [];
  const subtotal = useMemo(() => items.reduce((s: number, it: any) => s + it.unitPrice * it.quantity, 0), [items]);
  const discount = parseFloat(discountAmount) || 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <ScrollView style={styles.container}>
      {/* Bill Summary */}
      <View style={styles.card}>
        <Text style={styles.title}>📋 Bill Summary</Text>
        {items.map((it: any, idx: number) => (
          <Text key={idx} style={styles.item}>
            {it.name} (x{it.quantity}) - ₹{(it.unitPrice * it.quantity).toFixed(2)}
          </Text>
        ))}
      </View>

      {/* Discount */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>💲 Apply Discount</Text>
          <Switch value={discountEnabled} onValueChange={setDiscountEnabled} />
        </View>

        {discountEnabled && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter discount amount"
              keyboardType="numeric"
              value={discountAmount}
              onChangeText={setDiscountAmount}
            />
            <Text style={[styles.item, { color: "green", marginTop: 6 }]}>
              Discount applied: ${discount.toFixed(2)}
            </Text>
          </>
        )}
      </View>

      {/* Customer Details */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>👤 Customer Details</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.edit}>✏️</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.line} />
        <Text style={styles.item}>{name}</Text>
        <Text style={styles.item}>📞 {phone}</Text>
        <Text style={styles.item}>🏠 {address}</Text>
      </View>

      {/* Total */}
      <View style={styles.card}>
        <Text style={styles.title}>🧮 Total Calculation</Text>
        <View style={styles.line} />
        <Text style={styles.item}>Subtotal: ₹{subtotal.toFixed(2)}</Text>
        <Text style={[styles.item, { color: "red" }] }>
          Discount: -₹{discount.toFixed(2)}
        </Text>
        <Text style={styles.total}>Total Amount: ₹{total.toFixed(2)}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>⬅️ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={async () => {
            // Create customer if needed then create bill
            let customerId: string | undefined;
            if (name.trim()) {
              const c = await customersApi.create({ name, phone, address });
              customerId = c._id || c.id;
            }
            await billsApi.create({
              customerId,
              items: items.map((it: any) => ({ productId: it.productId, quantity: it.quantity })),
              discount,
              paymentMethod: 'Cash',
              amountPaid: total, // mark as fully paid; adjust based on UI later
            });
            navigation.navigate("PaymentScreen");
          }}
        >
          <Text style={styles.payText}>Next 💳</Text>
        </TouchableOpacity>
      </View>

      {/* Customer Details Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>👤 Enter Customer Details</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
              multiline
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.saveText}>💾 Save & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  item: { fontSize: 16, marginVertical: 4 },
  total: { fontSize: 18, fontWeight: "bold", color: "#4A90E2", marginTop: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  edit: { fontSize: 20 },
  line: { height: 1, backgroundColor: "#eee", marginVertical: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 30,
  },
  backBtn: {
    flex: 1,
    marginRight: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  backText: { fontSize: 20, fontWeight: "bold", color: "#333" },
  payBtn: {
    flex: 1,
    marginLeft: 6,
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  payText: { fontSize: 20, fontWeight: "bold", color: "#fff", textAlign: "center" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  saveBtn: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
