import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { PermissionsAndroid, Platform, Linking } from 'react-native';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  brand: string;
  category: string;
}

interface Brand { id: string; name: string; emoji?: string }

interface FilterTabProps {
  title: string;
  emoji: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterTab = ({ title, emoji, isActive, onPress }: FilterTabProps) => (
  <TouchableOpacity 
    style={[styles.filterTab, isActive && styles.filterTabActive]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.filterEmoji}>{emoji}</Text>
    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

type ProductListScreenRouteProp = RouteProp<
  {
    ProductList: {
      brand: Brand;
      products: Product[];
    };
  },
  "ProductList"
>;

export default function ProductListScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProductListScreenRouteProp>();
  const { brand } = route.params;
  const { brandsApi, productsApi, categoriesApi } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [brandStockTotal, setBrandStockTotal] = useState<number>(0);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [activeFilter, setActiveFilter] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('allTime');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addStockQuantity, setAddStockQuantity] = useState("");

  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [productBarcode, setProductBarcode] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isScannerVisible, setIsScannerVisible] = useState(false);

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'We need access to your camera to scan barcodes.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;
      if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Permission required',
          'Camera permission is permanently denied. Open settings to enable it.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats, stock] = await Promise.all([
        brandsApi.products(brand.id),
        categoriesApi.list(),
        brandsApi.stockTotal(brand.id),
      ]);
      setProducts(prods as any);
      setCategories(cats);
      setBrandStockTotal(stock.stockTotal ?? 0);
    } catch {
      Alert.alert('Error', 'Failed to load products/categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [brand.id]);

  const handleCreateProduct = () => {
    setIsEditMode(false);
    setEditingProduct(null);
    setProductName("");
    setProductPrice("");
    setProductStock("0");
    setProductDetails("");
    setProductBarcode("");
    setSelectedCategoryId("");
    setIsProductModalVisible(true);
  };

  const handleEditProduct = (product: Product) => {
    setIsEditMode(true);
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(String(product.price));
    setProductStock(String(product.stock));
    setAddStockQuantity("");
    setProductDetails("");
    setProductBarcode("");
    setSelectedCategoryId(product.category);
    setIsProductModalVisible(true);
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      "Delete Product",
      "Do you really want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await productsApi.remove(product._id);
              setProducts(products.filter(p => p._id !== product._id));
              Alert.alert("Success", "Product deleted successfully");
            } catch {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleSaveProduct = async () => {
    if (!productName.trim() || !productPrice.trim() || !selectedCategoryId) {
      Alert.alert("Error", "Please fill in name, price, and category");
      return;
    }

    const numericPrice = Number((productPrice || '').toString().replace(/[^0-9.\-]/g, ''));
    const base = {
      name: productName,
      description: productDetails || undefined,
      barcode: productBarcode || undefined,
      price: isNaN(numericPrice) ? 0 : numericPrice,
      stock: Math.max(0, Number(productStock) + (parseInt(addStockQuantity) || 0)),
      categoryId: selectedCategoryId,
    };

    try {
      if (isEditMode && editingProduct) {
        const updated = await productsApi.update(editingProduct._id, base);
        setProducts(products.map(p => (p._id === editingProduct._id ? updated : p)));
        Alert.alert('Success', 'Product updated successfully');
      } else {
        const created = await brandsApi.createProduct(brand.id, base);
        setProducts([created, ...products]);
        Alert.alert('Success', 'Product created successfully');
      }
      setIsProductModalVisible(false);
    } catch {
      Alert.alert('Error', isEditMode ? 'Failed to update product' : 'Failed to create product');
    }
  };

  const getStatusColor = (stock: number) => {
    if (stock === 0) return "#EF4444";
    if (stock < 5) return "#F59E0B";
    return "#10B981";
  };

  const getStatusText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 5) return "Low Stock";
    return "In Stock";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{brand.name}</Text>
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>📦 {brandStockTotal} units</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <FilterTab 
            title="Today" 
            emoji="📅" 
            isActive={activeFilter === 'daily'} 
            onPress={() => setActiveFilter('daily')} 
          />
          <FilterTab 
            title="This Week" 
            emoji="📆" 
            isActive={activeFilter === 'weekly'} 
            onPress={() => setActiveFilter('weekly')} 
          />
          <FilterTab 
            title="This Month" 
            emoji="📊" 
            isActive={activeFilter === 'monthly'} 
            onPress={() => setActiveFilter('monthly')} 
          />
          <FilterTab 
            title="All Time" 
            emoji="📈" 
            isActive={activeFilter === 'allTime'} 
            onPress={() => setActiveFilter('allTime')} 
          />
        </ScrollView>
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <TouchableOpacity
              style={styles.productContent}
              onPress={() => {
                setSelectedProduct(item);
                setIsModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.productIconContainer}>
                <Text style={styles.productIcon}>📦</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productPrice}>₹{item.price.toLocaleString()}</Text>
                <View style={styles.stockRow}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.stock) }]} />
                  <Text style={styles.productStock}>{item.stock} available</Text>
                </View>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: `${getStatusColor(item.stock)}20` }
                ]}
              >
                <Text style={[styles.badgeText, { color: getStatusColor(item.stock) }]}>
                  {getStatusText(item.stock)}
                </Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditProduct(item)}
                activeOpacity={0.6}
              >
                <Text style={styles.actionIcon}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteActionButton]}
                onPress={() => handleDeleteProduct(item)}
                activeOpacity={0.6}
              >
                <Text style={styles.actionIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Product Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreateProduct}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Create/Edit Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isProductModalVisible}
        onRequestClose={() => setIsProductModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditMode ? "Edit Product" : "Create Product"}
              </Text>
              <TouchableOpacity 
                onPress={() => setIsProductModalVisible(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  placeholderTextColor="#9CA3AF"
                  value={productName}
                  onChangeText={setProductName}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="₹0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={productPrice}
                  onChangeText={setProductPrice}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Current Stock: {productStock} available
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Add or Remove Stock (+/-)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={addStockQuantity}
                  onChangeText={setAddStockQuantity}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category *</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dropdownText,
                    !selectedCategoryId && { color: "#9CA3AF" }
                  ]}>
                    {categories.find(c => c._id === selectedCategoryId)?.name || 'Select Category'}
                  </Text>
                  <Text style={styles.dropdownArrow}>{showCategoryDropdown ? "▲" : "▼"}</Text>
                </TouchableOpacity>

                {showCategoryDropdown && (
                  <View style={styles.dropdownList}>
                    {categories.map((c) => (
                      <TouchableOpacity
                        key={c._id}
                        style={[
                          styles.dropdownItem,
                          selectedCategoryId === c._id && styles.selectedDropdownItem
                        ]}
                        onPress={() => {
                          setSelectedCategoryId(c._id);
                          setShowCategoryDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownItemText}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.createCategoryButton}
                      onPress={() => setIsCategoryModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.createCategoryText}>+ Create Category</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Details</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter product details (optional)"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  value={productDetails}
                  onChangeText={setProductDetails}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Barcode</Text>
                <View style={styles.barcodeRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Enter or scan barcode"
                    placeholderTextColor="#9CA3AF"
                    value={productBarcode}
                    onChangeText={setProductBarcode}
                  />
                  <TouchableOpacity
                    style={styles.scanButton}
                    onPress={async () => {
                      const ok = await requestCameraPermission();
                      if (ok) setIsScannerVisible(true);
                      else Alert.alert('Permission required', 'Camera permission was denied');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.scanButtonIcon}>📷</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setIsProductModalVisible(false);
                    setProductName("");
                    setProductPrice("");
                    setProductStock("");
                    setProductDetails("");
                    setProductBarcode("");
                    setSelectedCategoryId("");
                    setShowCategoryDropdown(false);
                    setIsEditMode(false);
                    setEditingProduct(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveProduct}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>
                    {isEditMode ? "Update" : "Create"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Scanner Modal */}
      <Modal
        animationType="fade"
        transparent={false}
        visible={isScannerVisible}
        onRequestClose={() => setIsScannerVisible(false)}
      >
        <View style={styles.scannerContainer}>
        
          <TouchableOpacity
            style={styles.closeScanner}
            onPress={() => setIsScannerVisible(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.closeScannerText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Create Category Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={isCategoryModalVisible}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Category</Text>
              <TouchableOpacity 
                onPress={() => setIsCategoryModalVisible(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter category name"
                placeholderTextColor="#9CA3AF"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsCategoryModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={async () => {
                  if (!newCategoryName.trim()) {
                    Alert.alert('Error', 'Please enter category name');
                    return;
                  }
                  try {
                    const created = await categoriesApi.create({ name: newCategoryName.trim() });
                    setCategories([created, ...categories]);
                    setSelectedCategoryId(created._id);
                    setIsCategoryModalVisible(false);
                    setNewCategoryName('');
                  } catch {
                    Alert.alert('Error', 'Failed to create category');
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backArrow: {
    fontSize: 22,
    color: "#374151",
    fontWeight: "bold",
  },
  headerCenter: {
display: "flex",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  stockBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockBadgeText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600",
  },
  filterSection: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginRight: 10,
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    shadowColor: "#3B82F6",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  filterEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.2,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productContent: {
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
  },
  productIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productIcon: {
    fontSize: 28,
  },
  productInfo: { 
    flex: 1,
  },
  productName: { 
    fontSize: 15, 
    fontWeight: "700", 
    marginBottom: 4, 
    color: "#111827",
    letterSpacing: 0.2,
  },
  productPrice: { 
    fontSize: 16, 
    color: "#3B82F6", 
    fontWeight: "700",
    marginBottom: 6,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  productStock: { 
    fontSize: 13, 
    color: "#6B7280",
    fontWeight: "500",
  },
  badge: { 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 10,
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  productActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  deleteActionButton: {
    borderLeftWidth: 1,
    borderLeftColor: "#F3F4F6",
  },
  actionIcon: {
    fontSize: 18,
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#3B82F6",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "300",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  createModalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.3,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  dropdownButton: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  dropdownText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  dropdownArrow: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "700",
  },
  dropdownList: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: "#fff",
    maxHeight: 200,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedDropdownItem: {
    backgroundColor: "#EFF6FF",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  createCategoryButton: {
    padding: 14,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  createCategoryText: {
    color: "#3B82F6",
    fontWeight: "700",
    fontSize: 15,
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scanButton: {
    width: 48,
    height: 48,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  scanButtonIcon: {
    fontSize: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  closeScanner: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  closeScannerText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 15,
  },
});