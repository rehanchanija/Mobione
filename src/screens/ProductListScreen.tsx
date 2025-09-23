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
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { brandsApi, categoriesApi, productsApi } from "../services/api";

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

// Available brands for dropdown
const availableBrands: Brand[] = [
  { id: "1", name: "Apple", emoji: "🍎" },
  { id: "2", name: "Samsung", emoji: "📱" },
  { id: "3", name: "OnePlus", emoji: "⭐" },
  { id: "4", name: "Xiaomi", emoji: "📱" },
  { id: "5", name: "Google", emoji: "🤖" },
  { id: "6", name: "Nothing", emoji: "💡" },
];

export default function ProductListScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProductListScreenRouteProp>();
  const { brand } = route.params;

  const [products, setProducts] = useState<Product[]>([]);
  const [brandStockTotal, setBrandStockTotal] = useState<number>(0);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [activeFilter, setActiveFilter] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('allTime');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addStockQuantity, setAddStockQuantity] = useState("");

  // States for create/edit product modal
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

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
    setSelectedCategoryId("");
    setIsProductModalVisible(true);
  };

  const handleEditProduct = (product: Product) => {
  setIsEditMode(true);
  setEditingProduct(product);
  setProductName(product.name);
  setProductPrice(String(product.price));
  setProductStock(String(product.stock));
  setAddStockQuantity(""); // blank input for adding stock
  setProductDetails("");
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View 
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
          <Text style={styles.brandTitle}>
            Total Stock: {brandStockTotal}
          </Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
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
            >
              <View style={styles.productInfo}>
                <Text style={styles.emoji}>📦</Text>
                <View>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>💰 {item.price}</Text>
                  <Text style={styles.productStock}>📦 {item.stock} available</Text>
                </View>
              </View>
              <View
                style={[
                  styles.badge,
                  item.stock > 0 ? (item.stock < 5 ? styles.lowStock : styles.inStock) : styles.outOfStock,
                ]}
              >
                <Text style={styles.badgeText}>{item.stock > 0 ? (item.stock < 5 ? 'Low Stock' : 'In Stock') : 'Out of Stock'}</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditProduct(item)}
              >
                <Text style={styles.actionEmoji}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteProduct(item)}
              >
                <Text style={styles.actionEmoji}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add Product Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreateProduct}
      >
        <Text style={styles.addButtonText}>➕</Text>
      </TouchableOpacity>

      {/* Stock Update Modal */}
      

      {/* Create/Edit Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isProductModalVisible}
        onRequestClose={() => setIsProductModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {isEditMode ? "Edit Product" : "Create New Product"}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Product Name *"
                value={productName}
                onChangeText={setProductName}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Product Price (e.g., ₹50,000) *"
                value={productPrice}
                onChangeText={setProductPrice}
              />
              

             
<Text style={{ marginBottom: 4, fontWeight: '600' }}>
  Current Stock: {productStock} available
</Text>

<TextInput
  style={styles.input}
  placeholder="Add or Remove Stock (+/-)"
  keyboardType="numeric"
  value={addStockQuantity}
  onChangeText={setAddStockQuantity}
/>


              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {categories.find(c => c._id === selectedCategoryId)?.name || 'Select Category *'}
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
                    >
                      <Text style={styles.dropdownItemText}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[styles.dropdownItem, { alignItems: 'center' }]}
                    onPress={() => setIsCategoryModalVisible(true)}
                  >
                    <Text style={{ color: '#007AFF', fontWeight: '600' }}>+ Create Category</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Product Details (Optional)"
                multiline
                numberOfLines={4}
                value={productDetails}
                onChangeText={setProductDetails}
                textAlignVertical="top"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setIsProductModalVisible(false);
                    setProductName("");
                    setProductPrice("");
                    setProductStock("");
                    setProductDetails("");
                    setSelectedCategoryId("");
                    setShowCategoryDropdown(false);
                    setIsEditMode(false);
                    setEditingProduct(null);
                  }}
                >
                  <Text style={[styles.buttonText, { color: "#666" }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.updateButton]}
                  onPress={handleSaveProduct}
                >
                  <Text style={styles.buttonText}>
                    {isEditMode ? "Update Product" : "Create Product"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
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
            <Text style={styles.modalTitle}>Create Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Category Name *"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsCategoryModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: '#666' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
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
              >
                <Text style={styles.buttonText}>Create</Text>
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
    backgroundColor: "#FFFFFF", 
    paddingHorizontal: 24,
    paddingVertical:12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginRight: 24,
  },
  backButtonText: { 
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
 brandTitle: { 
  fontSize: 16, 
  fontWeight: "600",
  color: "#1a1a1a",
  textAlign: "center",
  backgroundColor: "transparent"
},
  filterContainer: {
    marginBottom: 20,
    paddingVertical: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterTabActive: {
    backgroundColor: '#6a5acd',
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterTextActive: {
    color: '#fff',
  },
  productCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 4,
  },
  productContent: {
    flexDirection: "row",
    padding: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  productActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRightWidth: 0.5,
    borderRightColor: "#F0F0F0",
  },
  actionEmoji: {
    fontSize: 18,
  },
  productInfo: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  emoji: { 
    fontSize: 30, 
    marginRight: 15 
  },
  productName: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 4, 
    color: "#1a1a1a" 
  },
  productPrice: { 
    fontSize: 14, 
    color: "#666", 
    marginBottom: 4 
  },
  productStock: { 
    fontSize: 12, 
    color: "#888" 
  },
  badge: { 
    paddingVertical: 4, 
    paddingHorizontal: 8, 
    borderRadius: 12 
  },
  inStock: { 
    backgroundColor: "#E8F5E9" 
  },
  lowStock: { 
    backgroundColor: "#FFF3E0" 
  },
  outOfStock: { 
    backgroundColor: "#FFEBEE" 
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: "500" 
  },
  addButton :{  position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#ffff",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  addButtonText: {
    fontSize: 28,
    color: "#eeefeefe",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  createModalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1a1a1a",
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#FFF",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedDropdownItem: {
    backgroundColor: "#F0F8FF",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#EEE",
  },
  updateButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});