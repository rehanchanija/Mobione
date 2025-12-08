import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { billsApi, customersApi, productsApi } from '../services/api';

export default function EditBillScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { billId } = route.params as { billId: string };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [discount, setDiscount] = useState<string>('0');
  const [amountPaid, setAmountPaid] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online'>('Cash');

  const [billNumber, setBillNumber] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');

  const [items, setItems] = useState<Array<{ productId: string; name: string; price: number; quantity: number }>>([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ _id: string; name: string; price: number }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const bill = await billsApi.get(billId);
        setBillNumber(String(bill.billNumber || bill._id));
        setCustomerId(String(bill.customer?._id || ''));
        setCustomerName(String(bill.customer?.name || ''));
        setCustomerPhone(String(bill.customer?.phone || ''));
        setCustomerAddress(String(bill.customer?.address || ''));
        setDiscount(String(bill.discount || 0));
        setAmountPaid(String(bill.amountPaid || 0));
        setPaymentMethod(bill.paymentMethod === 'Online' ? 'Online' : 'Cash');
        const mappedItems = (bill.items || []).map((it: any) => ({
          productId: String(it.product?._id || it.product),
          name: String(it.product?.name || it.name || ''),
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
        }));
        setItems(mappedItems);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Failed to load bill');
      } finally {
        setLoading(false);
      }
    })();
  }, [billId]);

  const searchProducts = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setSearching(true);
      const res = await productsApi.list(text, 1, 10);
      const mapped = (res || []).map((p: any) => ({ _id: String(p._id), name: String(p.name || ''), price: Number(p.price || 0) }));
      setSearchResults(mapped);
    } catch (_) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addItem = (product: { _id: string; name: string; price: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) => (i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product._id, name: product.name, price: product.price, quantity: 1 }];
    });
    setQuery('');
    setSearchResults([]);
  };

  const removeItem = (pid: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== pid));
  };

  const updateItemQty = (pid: string, qtyStr: string) => {
    const qty = Math.max(1, parseInt(qtyStr || '1') || 1);
    setItems((prev) => prev.map((i) => (i.productId === pid ? { ...i, quantity: qty } : i)));
  };

  const updateItemPrice = (pid: string, priceStr: string) => {
    const price = Math.max(0, parseFloat(priceStr || '0') || 0);
    setItems((prev) => prev.map((i) => (i.productId === pid ? { ...i, price } : i)));
  };

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.price * it.quantity, 0), [items]);
  const canSave = items.length > 0;

  const saveChanges = async () => {
    if (items.length === 0) {
      Alert.alert('Add Items', 'Please add at least one product before saving.');
      return;
    }
    try {
      setSaving(true);
      let newCustomerId = customerId;
      const shouldCreateCustomer = !customerId || customerName || customerPhone || customerAddress;
      if (shouldCreateCustomer) {
        try {
          const c = await customersApi.create({ name: customerName || 'Cash', phone: customerPhone || undefined, address: customerAddress || undefined });
          newCustomerId = String(c._id);
        } catch (_) {}
      }

      const payload: any = {
        customer: newCustomerId || customerId,
        items: items.map((i) => ({ product: i.productId, quantity: i.quantity, price: i.price })),
        discount: Number(discount) || 0,
        amountPaid: Number(amountPaid) || 0,
        paymentMethod,
      };
      await billsApi.update(billId, payload);
      Alert.alert('Success', 'Bill updated');
      navigation.navigate('BillHistory', { refreshBills: true });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update bill');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <ActivityIndicator size="large" color="#0066FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Bill</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Bill #{billNumber}</Text>
          <Text style={styles.subtitle}>Customer</Text>

          <View style={styles.field}><Text style={styles.label}>Name</Text><TextInput value={customerName} onChangeText={setCustomerName} style={styles.input} /></View>
          <View style={styles.field}><Text style={styles.label}>Phone</Text><TextInput value={customerPhone} onChangeText={setCustomerPhone} style={styles.input} keyboardType="phone-pad" /></View>
          <View style={styles.field}><Text style={styles.label}>Address</Text><TextInput value={customerAddress} onChangeText={setCustomerAddress} style={styles.input} /></View>

          <View style={styles.field}> 
            <Text style={styles.label}>Discount (₹)</Text>
            <TextInput value={discount} onChangeText={setDiscount} keyboardType="numeric" style={styles.input} />
          </View>

          <View style={styles.field}> 
            <Text style={styles.label}>Amount Paid (₹)</Text>
            <TextInput value={amountPaid} onChangeText={setAmountPaid} keyboardType="numeric" style={styles.input} />
          </View>

          <View style={styles.fieldRow}> 
            <TouchableOpacity style={[styles.methodBtn, paymentMethod === 'Cash' && styles.methodActive]} onPress={() => setPaymentMethod('Cash')}>
              <Text style={[styles.methodText, paymentMethod === 'Cash' && styles.methodTextActive]}>💵 Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.methodBtn, paymentMethod === 'Online' && styles.methodActive]} onPress={() => setPaymentMethod('Online')}>
              <Text style={[styles.methodText, paymentMethod === 'Online' && styles.methodTextActive]}>💳 Online</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Items</Text>
          <View style={styles.field}><Text style={styles.label}>Search Product</Text><TextInput value={query} onChangeText={searchProducts} style={styles.input} placeholder="Type to search" /></View>
          {searching ? (
            <ActivityIndicator style={{ marginVertical: 8 }} />
          ) : (
            searchResults.length > 0 && (
              <View style={styles.searchList}>
                {searchResults.map((p) => (
                  <TouchableOpacity key={p._id} style={styles.searchItem} onPress={() => addItem(p)}>
                    <Text style={{ fontWeight: '700' }}>{p.name}</Text>
                    <Text>₹{p.price.toFixed(2)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )
          )}

          {items.map((i) => (
            <View key={i.productId} style={styles.itemRowEdit}>
              <View style={{ flex: 2 }}><Text style={{ fontWeight: '700' }}>{i.name}</Text></View>
              <View style={{ flex: 1 }}>
                <TextInput value={String(i.quantity)} onChangeText={(t) => updateItemQty(i.productId, t)} keyboardType="numeric" style={styles.inputSmall} />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput value={String(i.price)} onChangeText={(t) => updateItemPrice(i.productId, t)} keyboardType="numeric" style={styles.inputSmall} />
              </View>
              <TouchableOpacity onPress={() => removeItem(i.productId)} style={styles.removeBtn}><Text style={{ color: '#FFF' }}>Delete</Text></TouchableOpacity>
            </View>
          ))}

          <View style={{ marginVertical: 12 }}>
            <Text style={{ fontWeight: '700' }}>Subtotal: ₹{subtotal.toFixed(2)}</Text>
            {items.length === 0 && (
              <Text style={{ color: '#D32F2F', marginTop: 6 }}>Add at least one product to update the bill.</Text>
            )}
          </View>

          <TouchableOpacity disabled={saving || !canSave} style={[styles.saveBtn, (saving || !canSave) && { opacity: 0.6 }]} onPress={saveChanges}>
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  backButton: { padding: 8, minWidth: 60 },
  backButtonText: { fontSize: 16, color: '#0066FF', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', flex: 1, textAlign: 'center' },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  field: { marginBottom: 12 },
  fieldRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FAFAFA' },
  inputSmall: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 8, backgroundColor: '#FAFAFA' },
  methodBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#F5F5F5', alignItems: 'center' },
  methodActive: { backgroundColor: '#E8F0FF', borderColor: '#A5B4FC' },
  methodText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  methodTextActive: { color: '#1D4ED8' },
  saveBtn: { backgroundColor: '#0066FF', padding: 14, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  searchList: { borderWidth: 1, borderColor: '#EEE', borderRadius: 10, overflow: 'hidden', marginBottom: 12 },
  searchItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#EEE', flexDirection: 'row', justifyContent: 'space-between' },
  itemRowEdit: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  removeBtn: { backgroundColor: '#FF4444', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
});
