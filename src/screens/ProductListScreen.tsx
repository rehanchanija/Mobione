import React, { useState } from "react";
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

interface Product {
  id: string;
  name: string;
  price: string;
  stock: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  image: any;
  emoji: string;
  brandId: string;
  quantity?: number;
  sold?: {
    daily: number;
    weekly: number;
    monthly: number;
    allTime: number;
  };
}

interface Brand {
  id: string;
  name: string;
  emoji: string;
}

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
  const { brand, products: initialProducts } = route.params;

  const [products, setProducts] = useState<Product[]>(initialProducts);
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
  const [selectedBrandId, setSelectedBrandId] = useState(brand.id);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);

  const handleCreateProduct = () => {
    setIsEditMode(false);
    setEditingProduct(null);
    setProductName("");
    setProductPrice("");
    setProductStock("");
    setProductDetails("");
    setSelectedBrandId(brand.id);
    setIsProductModalVisible(true);
  };

  const handleEditProduct = (product: Product) => {
  setIsEditMode(true);
  setEditingProduct(product);
  setProductName(product.name);
  setProductPrice(product.price);
  // Show existing stock in a separate Text element
  setProductStock(product.stock.replace(" available", ""));
  setAddStockQuantity(""); // blank input for adding stock
  setProductDetails("");
  setSelectedBrandId(product.brandId);
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
          onPress: () => {
            setProducts(products.filter(p => p.id !== product.id));
            Alert.alert("Success", "Product deleted successfully");
          },
        },
      ]
    );
  };

  const handleSaveProduct = () => {
    if (!productName.trim() || !productPrice.trim() || !productStock.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

const stockNum = parseInt(productStock) + (parseInt(addStockQuantity) || 0);
   const addedStock = parseInt(addStockQuantity) || 0;
let newStockNum = parseInt(productStock) + addedStock;

// Prevent stock from going negative
if (newStockNum < 0) newStockNum = 0;

const newStatus =
  newStockNum === 0
    ? "Out of Stock"
    : newStockNum <= 5
    ? "Low Stock"
    : "In Stock";

const selectedBrand = availableBrands.find(b => b.id === selectedBrandId);

if (isEditMode && editingProduct) {
  const updatedProducts = products.map(p =>
    p.id === editingProduct.id
      ? {
          ...p,
          name: productName,
          price: productPrice,
          stock: `${newStockNum} available`,
          status: newStatus as "In Stock" | "Low Stock" | "Out of Stock",
          emoji: selectedBrand?.emoji || p.emoji,
          brandId: selectedBrandId,
        }
      : p
  );
  setProducts(updatedProducts);
  Alert.alert("Success", "Product updated successfully");
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
            {brand.emoji} {brand.name}
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
        keyExtractor={(item) => item.id}
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
                <Text style={styles.emoji}>{item.emoji}</Text>
                <View>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>💰 {item.price}</Text>
                  <Text style={styles.productStock}>📦 {item.stock}</Text>
                  <Text style={styles.productStock}>
                    🛒 Sold: {item.sold ? item.sold[activeFilter] : 0}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.badge,
                  item.status === "In Stock"
                    ? styles.inStock
                    : item.status === "Low Stock"
                    ? styles.lowStock
                    : styles.outOfStock,
                ]}
              >
                <Text style={styles.badgeText}>{item.status}</Text>
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
                onPress={() => setShowBrandDropdown(!showBrandDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {availableBrands.find(b => b.id === selectedBrandId)?.emoji} {availableBrands.find(b => b.id === selectedBrandId)?.name}
                </Text>
                <Text style={styles.dropdownArrow}>{showBrandDropdown ? "▲" : "▼"}</Text>
              </TouchableOpacity>

              {showBrandDropdown && (
                <View style={styles.dropdownList}>
                  {availableBrands.map((brand) => (
                    <TouchableOpacity
                      key={brand.id}
                      style={[
                        styles.dropdownItem,
                        selectedBrandId === brand.id && styles.selectedDropdownItem
                      ]}
                      onPress={() => {
                        setSelectedBrandId(brand.id);
                        setShowBrandDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>
                        {brand.emoji} {brand.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
                    setSelectedBrandId(brand.id);
                    setShowBrandDropdown(false);
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
  fontSize: 24, 
  fontWeight: "700",
  color: "#1a1a1a",
  flex: 1,
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