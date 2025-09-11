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

const brands: Brand[] = [
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

  const handleBrandPress = (brand: Brand) => {
    const brandProducts = products.filter(p => p.brandId === brand.id);
    navigation.navigate("ProductList", {
      brand: brand.name,
      products: brandProducts,
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={brands}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.brandCard}
            onPress={() => handleBrandPress(item)}
          >
            <Text style={styles.brandEmoji}>{item.emoji}</Text>
            <Text style={styles.brandName}>{item.name}</Text>
            <Text style={styles.productCount}>
              {products.filter(p => p.brandId === item.id).length} Products
            </Text>
          </TouchableOpacity>
        )}
      />
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
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  // productName: {
  //   fontSize: 17,
  //   fontWeight: "700",
  //   color: "#111",
  // },
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
  // badge: {
  //   paddingVertical: 4,
  //   paddingHorizontal: 10,
  //   borderRadius: 8,
  // },
  // inStock: {
  //   backgroundColor: "#E1F9E3",
  // },
  // lowStock: {
  //   backgroundColor: "#FFF5D9",
  // },
  // outStock: {
  //   backgroundColor: "#FDE2E2",
  // },
  // badgeText: {
  //   fontSize: 12,
  //   fontWeight: "600",
  //   color: "#333",
  // },
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
