import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";

export default function CreateProfileScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Edit Pencil Button (Emoji) */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.editEmoji}>✏️</Text>
        <Text style={styles.editText}>Edit Shop</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)} // close on outside tap
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.title}>🏪 Shop Details</Text>

            <TextInput placeholder="Shop Name" style={styles.input} />
            <TextInput placeholder="Owner Name" style={styles.input} />
            <TextInput placeholder="Shop Address" style={styles.input} />
            <TextInput placeholder="Owner Contact Number" style={styles.input} />
            <TextInput placeholder="Email" style={styles.input} />

            {/* Upload Logo */}
            <TouchableOpacity style={styles.uploadBtn}>
              <Text style={styles.uploadText}>🖼️ Upload Logo</Text>
            </TouchableOpacity>

            {/* Save */}
            <TouchableOpacity style={styles.saveBtn}>
              <Text style={styles.saveText}>💾 Save</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 3,
  },
  editEmoji: { fontSize: 22 },
  editText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#4A90E2",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  uploadBtn: {
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  uploadText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#27ae60",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
