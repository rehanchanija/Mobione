import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

interface Product {
  id: string;
  name: string;
  price: string;
  stock: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  image: any;
  emoji: string;
  quantity?: number;
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 14 Pro",
    price: "₹1,20,000",
    stock: "15 available",
    status: "In Stock",
    image: require("../assets/iphone.jpg"),
    emoji: "📱",
  },
  {
    id: "2",
    name: "Samsung Galaxy S23",
    price: "₹95,000",
    stock: "8 available",
    status: "Low Stock",
    image: require("../assets/iphone.jpg"),
    emoji: "📱",
  },
  {
    id: "3",
    name: "OnePlus 11",
    price: "₹62,000",
    stock: "0 available",
    status: "Out of Stock",
    image: require("../assets/iphone.jpg"),
    emoji: "📱",
  },
  {
    id: "4",
    name: "Xiaomi 13 Pro",
    price: "₹55,000",
    stock: "22 available",
    status: "In Stock",
    image: require("../assets/phone.png"),
    emoji: "📱",
  },
];

export default function ProductsScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filter, setFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stockQuantity, setStockQuantity] = useState("");

  const filteredProducts =
    filter === "All"
      ? products
      : products.filter((p) => p.status === filter);

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterRow}>
        {["All", "In Stock", "Low Stock", "Out of Stock"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === "All" && "📦 All"}
              {f === "In Stock" && "✅ In Stock"}
              {f === "Low Stock" && "⚠️ Low"}
              {f === "Out of Stock" && "❌ Out"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
                      const newStatus = quantity === 0 
                        ? "Out of Stock" 
                        : quantity <= 5 
                        ? "Low Stock" 
                        : "In Stock";
                      const updatedProducts = products.map(p =>
                        p.id === selectedProduct.id
                          ? {
                              ...p,
                              stock: `${quantity} available`,
                              status: newStatus as "In Stock" | "Low Stock" | "Out of Stock"
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

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => handleProductPress(item)}
          >
            <Image source={item.image} style={styles.image} />
            <View style={styles.details}>
              <Text style={styles.productName}>
                {item.emoji} {item.name}
              </Text>
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.stock}>{item.stock}</Text>
            </View>
            <View
              style={[
                styles.badge,
                item.status === "In Stock"
                  ? styles.inStock
                  : item.status === "Low Stock"
                  ? styles.lowStock
                  : styles.outStock,
              ]}
            >
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating Add Product Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("CreateProduct" as never)} // <-- make sure you have CreateProduct screen in your navigator
      >
        <Text style={styles.addButtonText}>➕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    padding: 15,
    paddingTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  updateButton: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#EEE",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  filterTextActive: {
    color: "#fff",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  productName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  price: {
    fontSize: 15,
    color: "#4A90E2",
    fontWeight: "700",
    marginTop: 4,
  },
  stock: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  inStock: {
    backgroundColor: "#E1F9E3",
  },
  lowStock: {
    backgroundColor: "#FFF5D9",
  },
  outStock: {
    backgroundColor: "#FDE2E2",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  addButtonText: {
    fontSize: 28,
    color: "#fff",
  },
});
