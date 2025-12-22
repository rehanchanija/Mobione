import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
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
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const ProfileScreen = () => {
  const navigation = useNavigation();
  const screens = [
    {
      title: 'Staff Management',
      description: 'Manage roles, permissions and staff accounts',
      screen: 'StaffManagement',
    },
    {
      title: 'Sales Reports',
      description: 'View detailed sales analytics and reports',
      screen: 'SalesReport',
    },
    {
      title: 'Transaction History',
      description: 'View all transaction records and details',
      screen: 'TransactionHistory',
    },
    {
      title: 'Help & Support',
      description: 'Get help, contact support or view FAQs',
      screen: 'HelpSupport',
    },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopDetails, setShopDetails] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [shopImage, setShopImage] = useState<string | null>(null);
  const [tempShopName, setTempShopName] = useState('');
  const [tempShopDetails, setTempShopDetails] = useState('');
  const [tempOwnerName, setTempOwnerName] = useState('');
  const [tempOwnerEmail, setTempOwnerEmail] = useState('');
  const [tempOwnerPhone, setTempOwnerPhone] = useState('');
  const [tempShopImage, setTempShopImage] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(true);
  const pickImage = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', quality: 0.7 },
      response => {
        if (
          !response.didCancel &&
          !response.errorCode &&
          response.assets &&
          response.assets.length > 0
        ) {
          setTempShopImage(response.assets[0].uri || null);
        }
      },
    );
  };

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const { profile, updateProfile,logout, isProfileLoading, isUpdatingProfile, refetchProfile, profileError } =
    useAuth();

  const [checkingToken, setCheckingToken] = useState<boolean>(true);

  // Check token on mount and on focus
  const checkTokenAndMaybeFetch = useCallback(async () => {
    try {
      setCheckingToken(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        // No token found
        navigation.reset({
          index: 0,
          routes: [{ name: 'AuthScreen' as never }],
        });
        return;
      }
      
      // Token exists, let the profile query (with interceptor) handle token refresh if needed
      await refetchProfile();
    } finally {
      setCheckingToken(false);
    }
  }, [refetchProfile, navigation]);

  useEffect(() => {
    checkTokenAndMaybeFetch();
  }, [checkTokenAndMaybeFetch]);

  useFocusEffect(
    useCallback(() => {
      checkTokenAndMaybeFetch();
      return () => {};
    }, [checkTokenAndMaybeFetch])
  );

  // Handle profile fetch errors - redirect only if 401 after refresh attempt
  useEffect(() => {
    if (profileError && (profileError as any)?.response?.status === 401) {
      logout();
    }
  }, [profileError, logout]);

    
  useEffect(() => {
    
    if (profile) {
      setOwnerName(profile.name);
      setOwnerEmail(profile.email);
      setOwnerPhone(profile.phone || '');
      setShopName(profile.shopName || '');
      setShopDetails(profile.shopDetails || '');

      setTempOwnerName(profile.name);
      setTempOwnerEmail(profile.email);
      setTempOwnerPhone(profile.phone || '');
      setTempShopName(profile.shopName || '');
      setTempShopDetails(profile.shopDetails || '');
    }
  }, [profile]);

  // remove unconditional refetch above; token-checking handles it

  const handleSave = () => {
    if (!hasToken) {
      return;
    }
    updateProfile({
      name: tempOwnerName,
      email: tempOwnerEmail,
      phone: tempOwnerPhone,
      shopName: tempShopName,
      shopDetails: tempShopDetails,
    });

    // Close the modal
    setModalVisible(false);
  };

  const handleModalClose = () => {
    // Reset temp values when closing without saving
    setTempShopName(shopName);
    setTempShopDetails(shopDetails);
    setTempOwnerName(ownerName);
    setTempOwnerEmail(ownerEmail);
    setTempOwnerPhone(ownerPhone);
    setTempShopImage(shopImage);
    setModalVisible(false);
  };

  const openModal = () => {
    // Set temp values to current values when opening modal
    setTempShopName(shopName);
    setTempShopDetails(shopDetails);
    setTempOwnerName(ownerName);
    setTempOwnerEmail(ownerEmail);
    setTempOwnerPhone(ownerPhone);
    setTempShopImage(shopImage);
    setModalVisible(true);
  };

  const handlelogout = async () => {
   logout()
  };
  if (checkingToken) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasToken) {
    return null; // Alert + navigation reset will handle UI
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Custom Header with Back Button */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 30, padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Shop Info Card */}
        <TouchableOpacity style={styles.card} onPress={openModal}>
          <View style={styles.cardHeader}>
            <Text style={styles.editIcon}>✏️</Text>
            <Text style={styles.editText}>Tap to edit</Text>
          </View>

          {shopImage && (
            <Image
              source={{ uri: shopImage }}
              style={styles.shopImagePreview}
            />
          )}

          {isProfileLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <>
              <Text style={styles.companyEmoji}>🏪</Text>
              <Text style={styles.companyName}>
                {shopName || 'No shop name'}
              </Text>
              <Text style={styles.companyAddress}>
                {shopDetails || 'No shop details'}
              </Text>
              <View style={styles.ownerContainer}>
                <Text style={styles.ownerBadge}>👑 Owner: {ownerName}</Text>
                <Text style={styles.ownerDetail}>{ownerEmail}</Text>
                <Text style={styles.ownerDetail}>
                  {ownerPhone || 'No phone'}
                </Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Navigation Items */}
        {screens.map((item, i) => (
          <TouchableOpacity
            style={styles.navItem}
            key={i}
            onPress={() => navigation.navigate(item.screen as never)}
          >
            <View style={styles.emojiBox}>
              <Text style={styles.emoji}>
                {['👥', '📊', '💳', '⚙️', '💬'][i]}
              </Text>
            </View>
            <View style={styles.navTextContainer}>
              <Text style={styles.navTitle}>{item.title}</Text>
              <Text style={styles.navDescription}>{item.description}</Text>
            </View>
            <Text style={styles.navChevron}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', onPress: handlelogout },
            ])
          }
        >
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ by MobiOne Team</Text>
  <Text style={styles.footerVersion}>Version 2.1.0 • © {new Date().getFullYear()} BuildsWith Rehan</Text>
        </View>

        {/* Edit Shop Details Modal */}
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Shop & Owner Details</Text>
                <TouchableOpacity
                  onPress={handleModalClose}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.imagePicker}
                >
                  {tempShopImage ? (
                    <Image
                      source={{ uri: tempShopImage }}
                      style={styles.shopImage}
                    />
                  ) : (
                    <View style={styles.imagePlaceholderContainer}>
                      <Text style={styles.imagePlaceholderEmoji}>📷</Text>
                      <Text style={styles.imagePlaceholder}>
                        Upload Shop Image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>🏪 Shop Name</Text>
                  <TextInput
                    style={styles.input}
                    value={tempShopName}
                    onChangeText={setTempShopName}
                    placeholder="Enter shop name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>📍 Shop Details</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={tempShopDetails}
                    onChangeText={setTempShopDetails}
                    placeholder="Enter shop details"
                    placeholderTextColor="#9CA3AF"
                    multiline={true}
                    numberOfLines={2}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>👤 Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={tempOwnerName}
                    onChangeText={setTempOwnerName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>� Email</Text>
                  <TextInput
                    style={styles.input}
                    value={tempOwnerEmail}
                    onChangeText={setTempOwnerEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    placeholderTextColor="#9CA3AF"
                    editable={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>📞 Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={tempOwnerPhone}
                    onChangeText={setTempOwnerPhone}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.previewButton}
                    onPress={handlePreview}
                  >
                    <Text style={styles.previewButtonText}>👁️ Preview</Text>
                  </TouchableOpacity>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleModalClose}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        isUpdatingProfile && styles.saveButtonDisabled,
                      ]}
                      onPress={handleSave}
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.saveButtonText}>
                          💾 Save Changes
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Preview Modal */}
        <Modal animationType="fade" transparent={true} visible={previewVisible}>
          <View style={styles.previewOverlay}>
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Preview</Text>
                <TouchableOpacity onPress={() => setPreviewVisible(false)}>
                  <Text style={styles.previewClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.previewCard}>
                {tempShopImage && (
                  <Image
                    source={{ uri: tempShopImage }}
                    style={styles.previewImage}
                  />
                )}
                <Text style={styles.previewEmoji}>🏪</Text>
                <Text style={styles.previewName}>
                  {tempShopName || 'No shop name'}
                </Text>
                <Text style={styles.previewAddress}>
                  {tempShopDetails || 'No shop details'}
                </Text>
                <Text style={styles.previewOwner}>� Name: {tempOwnerName}</Text>
                <Text style={styles.previewOwner}>
                  📧 Email: {tempOwnerEmail}
                </Text>
                <Text style={styles.previewOwner}>
                  📞 Phone: {tempOwnerPhone || 'No phone number'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.previewCloseButton}
                onPress={() => setPreviewVisible(false)}
              >
                <Text style={styles.previewCloseButtonText}>Close Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  // Custom Header Styles
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 15,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: '#374151',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
  },

  // Removed old container styles since we're using scrollContainer now

  card: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  cardHeader: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  editText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  shopImagePreview: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 15,
  },
  companyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  companyAddress: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  ownerContainer: {
    marginTop: 12,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ownerBadge: {
    fontSize: 15,
    color: '#1D4ED8',
    fontWeight: '600',
    marginBottom: 4,
  },
  ownerDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },

  // Navigation Styles
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 18,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 22,
  },
  navTextContainer: {
    flex: 1,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  navDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  navChevron: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },

  // Button Styles
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#EF4444',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },

  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
    width: '92%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },

  // Image Picker Styles
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  shopImage: {
    width: 116,
    height: 116,
    borderRadius: 18,
  },
  imagePlaceholderContainer: {
    alignItems: 'center',
  },
  imagePlaceholderEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  imagePlaceholder: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Input Styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },

  // Modal Button Styles
  modalButtonContainer: {
    marginTop: 10,
  },
  previewButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Preview Modal Styles
  previewOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  previewContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  previewClose: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  previewCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 20,
  },
  previewImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
    marginBottom: 12,
  },
  previewEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  previewAddress: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  previewOwner: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  previewCloseButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  previewCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
