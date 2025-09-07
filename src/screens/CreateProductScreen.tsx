import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types"; // adjust path to your types

// ✅ Props type for this screen
type CreateProductProps = NativeStackScreenProps<RootStackParamList, "CreateProduct">;

export default function CreateProduct({ navigation }: CreateProductProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [barcode, setBarcode] = useState("");

  const handleSave = () => {
    // Save logic (API / state / DB)
    console.log({ name, price, stock, barcode });
    navigation.goBack(); // 👈 after saving, go back
  };

  return (
    <ScrollView style={styles.container}>
      {/* Upload Image */}
      <TouchableOpacity style={styles.imageUpload}>
        <Text style={styles.uploadText}>🖼️ Upload Product Image</Text>
      </TouchableOpacity>

      {/* Product Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>🏷️ Product Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter product name"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Price */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>💰 Price</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
      </View>

      {/* Stock */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>📦 Stock Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter stock"
          keyboardType="numeric"
          value={stock}
          onChangeText={setStock}
        />
      </View>

      {/* Barcode */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>🔖 Barcode / QR Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter barcode"
          value={barcode}
          onChangeText={setBarcode}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>💾 Save Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    padding: 20,
  },
  imageUpload: {
    backgroundColor: "#EEE",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
