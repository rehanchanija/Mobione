import { useNavigation } from "@react-navigation/native";
import React, { use, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  // Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const navigation=useNavigation();
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [role, setRole] = useState<"owner" | "staff">("owner");
  const [mode, setMode] = useState<"login" | "register">("login"); // 🔑 toggle

  return (
    <View style={styles.container}>
      {/* Top Logo */}
      {/* <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      /> */}
      
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate("MainTabs" as never)}
      >
        <Text style={styles.skipText}>Skip ➡️</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        {/* Toggle Login / Register */}
        <View style={styles.switchContainer}>
          <TouchableOpacity
            style={[styles.switchButton, mode === "login" && styles.activeSwitch]}
            onPress={() => setMode("login")}
          >
            <Text
              style={[
                styles.switchText,
                mode === "login" && styles.activeSwitchText,
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.switchButton,
              mode === "register" && styles.activeSwitch,
            ]}
            onPress={() => setMode("register")}
          >
            <Text
              style={[
                styles.switchText,
                mode === "register" && styles.activeSwitchText,
              ]}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>
          {mode === "login" ? "Welcome to FlowPay" : "Create an Account"}
        </Text>

        {/* Tabs for Email / Phone */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "email" && styles.activeTab]}
            onPress={() => setActiveTab("email")}
          >
            <Text
              style={[styles.tabText, activeTab === "email" && styles.activeTabText]}
            >
              📧 Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "phone" && styles.activeTab]}
            onPress={() => setActiveTab("phone")}
          >
            <Text
              style={[styles.tabText, activeTab === "phone" && styles.activeTabText]}
            >
              📱 Phone Number
            </Text>
          </TouchableOpacity>
        </View>

        {/* If Register, show Full Name */}
        {mode === "register" && (
          <View style={styles.inputBox}>
            <Text style={styles.emoji}>👤</Text>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>
        )}

        {/* Email or Phone Input */}
        {activeTab === "email" ? (
          <View style={styles.inputBox}>
            <Text style={styles.emoji}>📧</Text>
            <TextInput
              placeholder="email@example.com"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="email-address"
            />
          </View>
        ) : (
          <View style={styles.inputBox}>
            <Text style={styles.emoji}>📱</Text>
            <TextInput
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>
        )}

        {/* Password */}
        <View style={styles.inputBox}>
          <Text style={styles.emoji}>🔒</Text>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!isPasswordVisible}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)}>
            <Text style={styles.emoji}>
              {isPasswordVisible ? "🙈" : "👁️"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confirm Password (only for Register) */}
        {mode === "register" && (
          <View style={styles.inputBox}>
            <Text style={styles.emoji}>🔒</Text>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry={!isConfirmPasswordVisible}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() =>
                setConfirmPasswordVisible(!isConfirmPasswordVisible)
              }
            >
              <Text style={styles.emoji}>
                {isConfirmPasswordVisible ? "🙈" : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Forgot Password (only for Login) */}
        {mode === "login" && (
          <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 15 }}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        {/* Role Selection */}
        <Text style={styles.label}>
          {mode === "login" ? "Login as:" : "Register as:"}
        </Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setRole("owner")}
          >
            <Text style={styles.emoji}>{role === "owner" ? "🔘" : "⚪"}</Text>
            <Text style={styles.radioText}>Owner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setRole("staff")}
          >
            <Text style={styles.emoji}>{role === "staff" ? "🔘" : "⚪"}</Text>
            <Text style={styles.radioText}>Staff</Text>
          </TouchableOpacity>
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>
            {mode === "login" ? "Log In" : "Register"}
          </Text>
        </TouchableOpacity>
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
  skipButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    elevation: 5,
  },
  switchContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeSwitch: {
    backgroundColor: "#4A90E2",
  },
  switchText: {
    fontSize: 14,
    color: "#555",
  },
  activeSwitchText: {
    color: "#fff",
    fontWeight: "bold",
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
  emoji: {
    fontSize: 18,
    marginRight: 8,
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
});
