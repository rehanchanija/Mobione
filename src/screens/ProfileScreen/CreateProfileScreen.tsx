import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";


const CreateProfileScreen = () => {
  const [tempShopImage, setTempShopImage] = React.useState<string | null>(null);
  const navigation = useNavigation();
  
    // const pickImage = () => {
    //   ImagePicker.launchImageLibrary(
    //     { mediaType: "photo", quality: 0.7 },
    //     (response) => {
    //       if (!response.didCancel && !response.errorCode && response.assets && response.assets.length > 0) {
    //         setTempShopImage(response.assets[0].uri || null);
    //       }
    //     }
    //   );
    // };
    const handleCreateProfile = () => {
    navigation.navigate('MainTabs' as never);

    }
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#667eea", "#667eea"]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Skip Button */}
              <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('MainTabs' as never)}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              {/* Header Section */}
              <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoIcon}>🏪</Text>
                </View>
                <Text style={styles.appTitle}>Shop Details</Text>
                <Text style={styles.subtitle}>Let’s set up your shop profile</Text>
              </View>

              {/* Form Container */}
              <View style={styles.formContainer}>
                {/* <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                                  {tempShopImage ? (
                                    <Image source={{ uri: tempShopImage }} style={styles.shopImage} />
                                  ) : (
                                    <View style={styles.imagePlaceholderContainer}>
                                      <Text style={styles.imagePlaceholderEmoji}>📷</Text>
                                      <Text style={styles.imagePlaceholder}>Upload Shop Image</Text>
                                    </View>
                                  )}
                                </TouchableOpacity> */}
                {/* Shop Name with Camera Emoji */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>📷</Text> {/* Camera emoji */}
                  <TextInput
                    placeholder="Shop Name"
                    placeholderTextColor="#999"
                    style={styles.textInput}
                  />
                </View>

                {/* Shop Address */}
                <View style={[styles.inputContainer]}>
                  <Text style={styles.inputIcon}>📍</Text>
                  <TextInput
                    placeholder="Shop Address"
                    placeholderTextColor="#999"
                    multiline
                    style={[styles.textInput, { textAlignVertical: "top" }]}
                  />
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveBtn}>
                  <Text style={styles.saveText} onPress={handleCreateProfile
                    
                  }>💾 Create Shop Profile</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },

  // Skip button
  skipButton: {
    alignSelf: "flex-end",
    marginTop: 50,
    marginRight: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  skipButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Header
  logoSection: { alignItems: "center", marginTop: 20, marginBottom: 40 },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoIcon: { fontSize: 32 },
  appTitle: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#eee", textAlign: "center" },

  // Form
  formContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: { fontSize: 18, marginRight: 12 },
  textInput: { fontSize: 16, color: "#1a1a1a", flex: 1 },

  // Save Button
  saveBtn: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 16,
  },
  // imagePicker: { 
  //   width: 120, 
  //   height: 120, 
  //   borderRadius: 20, 
  //   backgroundColor: "#F9FAFB", 
  //   justifyContent: "center", 
  //   alignItems: "center", 
  //   marginBottom: 20,
  //   alignSelf: "center",
  //   borderWidth: 2,
  //   borderColor: "#E5E7EB",
  //   borderStyle: 'dashed',
  // },
  // shopImage: { 
  //   width: 116, 
  //   height: 116, 
  //   borderRadius: 18 
  // },
  // imagePlaceholderContainer: {
  //   alignItems: 'center',
  // },
  // imagePlaceholderEmoji: {
  //   fontSize: 32,
  //   marginBottom: 8,
  // },
  // imagePlaceholder: { 
  //   color: "#6B7280",
  //   fontSize: 14,
  //   fontWeight: "500",
  //   textAlign:'center'
  // },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default CreateProfileScreen;
