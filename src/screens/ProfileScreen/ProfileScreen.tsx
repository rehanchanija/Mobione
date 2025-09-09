import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Image,
  Modal,
  Button,
} from "react-native";
import * as ImagePicker from "react-native-image-picker";

const FlowPayProfileScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [shopName, setShopName] = useState("My Mobile Store");
  const [shopAddress, setShopAddress] = useState("45 Gandhi Road, Ahmedabad");
  const [ownerName, setOwnerName] = useState("Mohammed Rehan");
  const [shopImage, setShopImage] = useState<string | null>(null);

  const pickImage = () => {
   ImagePicker.launchImageLibrary(
    { mediaType: "photo", quality: 0.7 },
    (response) => {
      if (!response.didCancel && !response.errorCode && response.assets && response.assets.length > 0) {
        setShopImage(response.assets[0].uri || null);
      }}
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
          <Text style={styles.headerIcon}>🔔</Text>
        </View>

        {/* Shop Info */}
        <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)}>
          <Text style={styles.companyEmoji}>🏪</Text>
          <Text style={styles.companyName}>{shopName}</Text>
          <Text style={styles.companyAddress}>{shopAddress}</Text>
          <Text style={styles.ownerBadge}>👑 Owner: {ownerName}</Text>
        </TouchableOpacity>

        {/* Navigation Items */}
        {["Staff Management", "Sales Reports", "Inventory Management", "App Settings", "Help & Support"].map((item, i) => (
          <TouchableOpacity style={styles.navItem} key={i}>
            <View style={styles.emojiBox}>
              <Text style={styles.emoji}>{["👥", "📊", "📦", "⚙️", "💬"][i]}</Text>
            </View>
            <View style={styles.navTextContainer}>
              <Text style={styles.navTitle}>{item}</Text>
              <Text style={styles.navDescription}>
                {[
                  "Manage roles and accounts",
                  "Detailed sales analytics",
                  "Track your products",
                  "Preferences & notifications",
                  "Contact support or view FAQs",
                ][i]}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 2.1.0 • © 2024 FlowPay</Text>
        </View>

        {/* Modal */}
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Shop & Owner Details</Text>

              <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {shopImage ? (
                  <Image source={{ uri: shopImage }} style={styles.shopImage} />
                ) : (
                  <Text style={styles.imagePlaceholder}>Upload Image</Text>
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={shopName}
                onChangeText={setShopName}
                placeholder="Shop Name"
              />
              <TextInput
                style={styles.input}
                value={shopAddress}
                onChangeText={setShopAddress}
                placeholder="Shop Address"
              />
              <TextInput
                style={styles.input}
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="Owner Name"
              />

              <View style={{ flexDirection: "row", marginTop: 15 }}>
                <Button title="Close" color="#EF4444" onPress={() => setModalVisible(false)} />
                <View style={{ width: 10 }} />
                <Button title="Save" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FlowPayProfileScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1, paddingHorizontal: 20, marginTop: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20, backgroundColor: "#fff", alignItems: "center", borderRadius: 16, marginBottom: 20, elevation: 2 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  headerIcon: { fontSize: 26 },
  card: { backgroundColor: "#fff", marginBottom: 20, borderRadius: 18, padding: 24, alignItems: "center", elevation: 3 },
  companyEmoji: { fontSize: 42, marginBottom: 10 },
  companyName: { fontSize: 20, fontWeight: "700", color: "#111827" },
  companyAddress: { fontSize: 15, color: "#6B7280", textAlign: "center", marginTop: 6 },
  ownerBadge: { fontSize: 15, color: "#1D4ED8", marginTop: 8, fontWeight: "600" },
  navItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginBottom: 14, padding: 18, borderRadius: 14, elevation: 2 },
  emojiBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center", marginRight: 14 },
  emoji: { fontSize: 22 },
  navTextContainer: { flex: 1 },
  navTitle: { fontSize: 17, fontWeight: "600", color: "#111827" },
  navDescription: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  logoutButton: { marginTop: 20, backgroundColor: "#EF4444", paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  logoutText: { fontSize: 18, fontWeight: "600", color: "#fff" },
  footer: { alignItems: "center", marginTop: 24, marginBottom: 30 },
  footerText: { fontSize: 13, color: "#9CA3AF" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { width: "90%", backgroundColor: "#fff", borderRadius: 16, padding: 20, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  imagePicker: { width: 100, height: 100, borderRadius: 16, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  shopImage: { width: 100, height: 100, borderRadius: 16 },
  imagePlaceholder: { color: "#6B7280" },
  input: { width: "100%", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, marginBottom: 12 },
});
