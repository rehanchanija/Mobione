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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type ProductsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Brand {
  id: string;
  name: string;
  emoji: string;
}

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
}

const initialBrands: Brand[] = [
  { id: "1", name: "Apple", emoji: "🍎" },
  { id: "2", name: "Samsung", emoji: "📱" },
  { id: "3", name: "OnePlus", emoji: "⭐" },
  { id: "4", name: "Xiaomi", emoji: "📱" },
  { id: "5", name: "Google", emoji: "🤖" },
  { id: "6", name: "Nothing", emoji: "💡" },
];

const initialProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 14 Pro",
    price: "₹1,20,000",
    brandId: "1",
    stock: "15 available",
    status: "In Stock",
    image: require("../assets/iphone.jpg"),
    emoji: "📱",
  },
  {
    id: "2",
    name: "iPhone 13",
    price: "₹70,000",
    brandId: "1",
    stock: "20 available",
    status: "In Stock",
    image: require("../assets/iphone.jpg"),
    emoji: "📱",
  },
  {
    id: "3",
    name: "Samsung Galaxy S23",
    price: "₹95,000",
    brandId: "2",
    stock: "8 available",
    status: "Low Stock",
    image: require("../assets/iphone.jpg"),
    emoji: "📱",
  },
  {
    id: "4",
    name: "Samsung Galaxy Z Fold 5",
    price: "₹1,55,000",
    brandId: "2",
    stock: "5 available",
    status: "Low Stock",
    image: require("../assets/iphone.jpg"),
    emoji: "📱",
  },
  {
    id: "5",
    name: "OnePlus 11",
    price: "₹62,000",
    brandId: "3",
    stock: "0 available",
    status: "Out of Stock",
    image: require("../assets/iphone.jpg"),
    emoji: "📱",
  },
  {
    id: "6",
    name: "OnePlus Nord 3",
    price: "₹35,000",
    brandId: "3",
    stock: "12 available",
    status: "In Stock",
    image: require("../assets/iphone.jpg"),
    emoji: "📱",
  },
  {
    id: "11",
    name: "OnePlus 18",
    price: "₹62,000",
    brandId: "3",
    stock: "0 available",
    status: "Out of Stock",
    image: require("../assets/iphone.jpg"),
    emoji: "📱",
  },
  {
    id: "7",
    name: "Xiaomi 13 Pro",
    price: "₹55,000",
    brandId: "4",
    stock: "22 available",
    status: "In Stock",
    image: require("../assets/phone.png"),
    emoji: "📱",
  },
  {
    id: "8",
    name: "Google Pixel 7 Pro",
    price: "₹85,000",
    brandId: "5",
    stock: "7 available",
    status: "Low Stock",
    image: require("../assets/phone.png"),
    emoji: "🤖",
  },
  {
    id: "9",
    name: "Nothing Phone (2)",
    price: "₹45,000",
    brandId: "6",
    stock: "15 available",
    status: "In Stock",
    image: require("../assets/phone.png"),
    emoji: "💡",
  },
];

export default function ProductsScreen() {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const [products] = useState<Product[]>(initialProducts);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");
  const [brandEmoji, setBrandEmoji] = useState("");

  const handleBrandPress = (brand: Brand) => {
    const brandProducts = products.filter(p => p.brandId === brand.id);
    navigation.navigate("ProductList", {
      brand: brand.name,
      products: brandProducts,
    });
  };

  const handleCreateBrand = () => {
    setEditingBrand(null);
    setBrandName("");
    setBrandEmoji("");
    setModalVisible(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandEmoji(brand.emoji);
    setModalVisible(true);
  };

  const handleDeleteBrand = (brand: Brand) => {
    Alert.alert(
      "Delete Brand",
      "Do you really want to delete this brand?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setBrands(brands.filter(b => b.id !== brand.id));
          },
        },
      ]
    );
  };

  const handleSaveBrand = () => {
    if (!brandName.trim() || !brandEmoji.trim()) {
      Alert.alert("Error", "Please enter both brand name and emoji");
      return;
    }

    if (editingBrand) {
      // Update existing brand
      setBrands(brands.map(b => 
        b.id === editingBrand.id 
          ? { ...b, name: brandName, emoji: brandEmoji }
          : b
      ));
    } else {
      // Create new brand
      const newBrand: Brand = {
        id: (brands.length + 1).toString(),
        name: brandName,
        emoji: brandEmoji,
      };
      setBrands([...brands, newBrand]);
    }

    setModalVisible(false);
    setBrandName("");
    setBrandEmoji("");
    setEditingBrand(null);
  };

  const renderBrandCard = ({ item }: { item: Brand }) => (
    <View style={styles.brandCard}>
      <TouchableOpacity
        style={styles.brandContent}
        onPress={() => handleBrandPress(item)}
      >
        <Text style={styles.brandEmoji}>{item.emoji}</Text>
        <Text style={styles.brandName}>{item.name}</Text>
        <Text style={styles.productCount}>
          {products.filter(p => p.brandId === item.id).length} Products
        </Text>
      </TouchableOpacity>
      
      <View style={styles.brandActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditBrand(item)}
        >
          <Text style={styles.actionEmoji}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteBrand(item)}
        >
          <Text style={styles.actionEmoji}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={brands}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderBrandCard}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreateBrand}
      >
        <Text style={styles.addButtonText}>➕</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingBrand ? "Edit Brand" : "Create Brand"}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Brand Name"
              value={brandName}
              onChangeText={setBrandName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Brand Emoji"
              value={brandEmoji}
              onChangeText={setBrandEmoji}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveBrand}
              >
                <Text style={styles.saveButtonText}>
                  {editingBrand ? "Update" : "Create"}
                </Text>
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
    backgroundColor: "#F7F9FC",
    padding: 15,
    paddingTop: 20,
  },
  brandCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "#FFF",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  brandContent: {
    padding: 16,
    alignItems: "center",
  },
  brandEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  productCount: {
    fontSize: 14,
    color: "#666",
  },
  brandActions: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    width: "85%",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1a1a1a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
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
});