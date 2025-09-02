import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function LoginScreen() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [role, setRole] = useState<"owner" | "staff">("owner");

  return (
    <View style={styles.container}>
      {/* Top Logo */}
      <Image
        source={require("../assets/logo.png")} // <-- put your static logo here
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.title}>Welcome to FlowPay</Text>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "email" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("email")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "email" && styles.activeTabText,
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "phone" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("phone")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "phone" && styles.activeTabText,
              ]}
            >
              Phone Number
            </Text>
          </TouchableOpacity>
        </View>

        {/* Email Input */}
        {activeTab === "email" && (
          <View style={styles.inputBox}>
            <Icon name="mail-outline" size={20} color="#4A90E2" />
            <TextInput
              placeholder="email@example.com"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="email-address"
            />
          </View>
        )}

        {/* Phone Input */}
        {activeTab === "phone" && (
          <View style={styles.inputBox}>
            <Icon name="call-outline" size={20} color="#4A90E2" />
            <TextInput
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>
        )}

        {/* Password Input */}
        <View style={styles.inputBox}>
          <Icon name="lock-closed-outline" size={20} color="#4A90E2" />
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry={!isPasswordVisible}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!isPasswordVisible)}
          >
            <Icon
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#4A90E2"
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 15 }}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login As */}
        <Text style={styles.label}>Login as:</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setRole("owner")}
          >
            <Icon
              name={
                role === "owner" ? "radio-button-on" : "radio-button-off"
              }
              size={18}
              color="#4A90E2"
            />
            <Text style={styles.radioText}>Owner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setRole("staff")}
          >
            <Icon
              name={
                role === "staff" ? "radio-button-on" : "radio-button-off"
              }
              size={18}
              color="#4A90E2"
            />
            <Text style={styles.radioText}>Staff</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.signupText}>Register now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 160,
    height: 80,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#4A90E2",
  },
  tabText: {
    fontSize: 14,
    color: "#555",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  forgotText: {
    fontSize: 13,
    color: "#4A90E2",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  radioText: {
    fontSize: 14,
    marginLeft: 5,
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  footerText: {
    fontSize: 13,
    color: "#555",
  },
  signupText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4A90E2",
  },
});
