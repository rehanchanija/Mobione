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

export default function ProductListScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProductListScreenRouteProp>();
  const { brand, products: initialProducts } = route.params;

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeFilter, setActiveFilter] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('allTime');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stockQuantity, setStockQuantity] = useState("");

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
          title="Toay" 
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
          <TouchableOpacity
            style={styles.productCard}
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
        )}
      />

      {/* Stock Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Stock</Text>
            {selectedProduct && (
              <View>
                <Text style={styles.modalText}>
                  Product: {selectedProduct.name}
                </Text>
                <Text style={styles.modalText}>
                  Current Stock: {selectedProduct.stock}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new stock quantity"
                  keyboardType="numeric"
                  value={stockQuantity}
                  onChangeText={setStockQuantity}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setIsModalVisible(false);
                      setStockQuantity("");
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.updateButton]}
                    onPress={() => {
                      if (!stockQuantity.trim()) {
                        Alert.alert("Error", "Please enter a valid quantity");
                        return;
                      }
                      const quantity = parseInt(stockQuantity);
                      if (isNaN(quantity) || quantity < 0) {
                        Alert.alert("Error", "Please enter a valid quantity");
                        return;
                      }
                      const newStatus =
                        quantity === 0
                          ? "Out of Stock"
                          : quantity <= 5
                          ? "Low Stock"
                          : "In Stock";

                      const updatedProducts = products.map((p: Product) =>
                        p.id === selectedProduct.id
                          ? {
                              ...p,
                              stock: `${quantity} available`,
                              status: newStatus as
                                | "In Stock"
                                | "Low Stock"
                                | "Out of Stock",
                            }
                          : p
                      );

                      setProducts(updatedProducts);
                      setIsModalVisible(false);
                      setStockQuantity("");
                      Alert.alert("Success", "Stock updated successfully");
                    }}
                  >
                    <Text style={styles.buttonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
    paddingVertical:12
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    // paddingHorizontal:12
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginRight: 24,  // increased spacing
  },
  backButtonText: { 
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
 brandTitle: { 
  fontSize: 24, 
  fontWeight: "700",
  color: "#1a1a1a",    // keep dark text
  flex: 1,             // take remaining space beside back button
  textAlign: "center", // center brand name
  backgroundColor: "transparent" // remove black background
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
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: "space-between",
    alignItems: "center",
    elevation:4,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1a1a1a",
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
    padding: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
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
