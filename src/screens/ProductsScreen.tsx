import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import CreateProduct from "./CreateProductScreen";

const products = [
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
  const [filter, setFilter] = useState("All");
  const navigation = useNavigation();

  const filteredProducts =
    filter === "All"
      ? products
      : products.filter((p) => p.status === filter);

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

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
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
          </View>
        )}
      />

      {/* Floating Add Product Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("CreateProductScreen")} // <-- make sure you have CreateProduct screen in your navigator
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
