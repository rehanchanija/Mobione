import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
  TextInput,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HelpTopic {
  id: string;
  title: string;
  emoji: string;
  steps: string[];
}

const HelpSupportScreen = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const helpTopics = useMemo<HelpTopic[]>(() => [
    {
      id: '1',
      title: 'Create Bill',
      emoji: '🧾',
      steps: [
        'Open the Billing section from home',
        'Select products by tapping or scanning',
        'Review items and quantities',
        'Tap "Proceed to Bill"',
        'Enter customer details and payment method',
        'Confirm and generate bill'
      ]
    },
    {
      id: '2',
      title: 'Print & Share Bill',
      emoji: '🖨️',
      steps: [
        'Open bill from Transaction History',
        'Tap "Print" button at top',
        'Choose print or save as PDF',
        'Use "Share" for WhatsApp, Email, etc.',
        'Auto-formatted for thermal printers'
      ]
    },
    {
      id: '3',
      title: 'Add Products',
      emoji: '➕',
      steps: [
        'Go to Brands or Product List',
        'Tap "Add Product" button',
        'Fill name, price, and category',
        'Add barcode and stock (optional)',
        'Tap "Save" to add product'
      ]
    },
    {
      id: '4',
      title: 'Delete Products',
      emoji: '🗑️',
      steps: [
        'Open Product List screen',
        'Find the product to delete',
        'Tap delete icon on card',
        'Confirm deletion in popup'
      ]
    },
    {
      id: '5',
      title: 'Transaction History',
      emoji: '📊',
      steps: [
        'Go to Profile → Transaction History',
        'Use date filters for specific periods',
        'Filter by payment status',
        'Search by customer or bill number',
        'Tap transaction for full details',
        'Pull down to refresh list'
      ]
    },
    {
      id: '6',
      title: 'Sales Reports',
      emoji: '📈',
      steps: [
        'Go to Profile → Sales Report',
        'View total sales and revenue',
        'Filter by date range',
        'Check charts for trends',
        'Export reports for accounting'
      ]
    },
    {
      id: '7',
      title: 'Manage Inventory',
      emoji: '📦',
      steps: [
        'Access Product List or Brands',
        'View current stock levels',
        'Tap "Edit" to update quantity',
        'Set low stock alerts',
        'Monitor stock in reports'
      ]
    },
    {
      id: '8',
      title: 'Customer Management',
      emoji: '👥',
      steps: [
        'Save customer details during billing',
        'View customer purchase history',
        'Track pending payments',
        'Send payment reminders',
        'Export customer data'
      ]
    }
  ], []);

  const filteredTopics = useMemo(() => {
    const ql = query.trim().toLowerCase();
    if (!ql) return helpTopics;
    return helpTopics.filter(topic => 
      topic.title.toLowerCase().includes(ql) || 
      topic.steps?.some(step => step.toLowerCase().includes(ql))
    );
  }, [helpTopics, query]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:rehanchanija@gmail.com');
  };

  const handleCall = () => {
    Linking.openURL('tel:7803997187');
  };

  const handleChat = () => {
    navigation.navigate('SupportChat' as never);
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>We're here to help</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Contact Actions */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need immediate help?</Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactBtn} onPress={handleChat}>
              <Text style={styles.contactEmoji}>💬</Text>
              <Text style={styles.contactLabel}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
              <Text style={styles.contactEmoji}>📞</Text>
              <Text style={styles.contactLabel}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn} onPress={handleContactSupport}>
              <Text style={styles.contactEmoji}>📧</Text>
              <Text style={styles.contactLabel}>Email</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.contactInfo}>7803997187 • rehanchanija@gmail.com</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchCard}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search help topics..."
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Help Topics with Accordion */}
        <View style={styles.topicsCard}>
          <Text style={styles.sectionTitle}>📚 FAQ</Text>
          <Text style={styles.sectionSubtitle}>
            Tap any topic to see step-by-step instructions
          </Text>
          
          {filteredTopics.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsEmoji}>🔍</Text>
              <Text style={styles.noResultsText}>No topics found</Text>
              <Text style={styles.noResultsSubtext}>Try a different search term</Text>
            </View>
          ) : (
            filteredTopics.map((topic) => {
              const isExpanded = expandedId === topic.id;
              return (
                <TouchableOpacity
                  key={topic.id}
                  style={[
                    styles.topicItem,
                    isExpanded && styles.topicItemExpanded
                  ]}
                  onPress={() => toggleExpand(topic.id)}
                  activeOpacity={0.7}
                >
                  {/* Topic Header */}
                  <View style={styles.topicHeader}>
                    <View style={styles.topicLeft}>
                      <View style={styles.topicIconContainer}>
                        <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                      </View>
                      <Text style={styles.topicTitle}>{topic.title}</Text>
                    </View>
                    <View style={[
                      styles.expandIcon,
                      isExpanded && styles.expandIconRotated
                    ]}>
                      <Text style={styles.expandText}>›</Text>
                    </View>
                  </View>

                  {/* Expandable Steps */}
                  {isExpanded && (
                    <View style={styles.stepsContainer}>
                      <View style={styles.stepsDivider} />
                      {topic.steps.map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                          <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>{index + 1}</Text>
                          </View>
                          <Text style={styles.stepText}>{step}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Still Need Help Section */}
        <View style={styles.stillNeedHelp}>
          <Text style={styles.stillNeedHelpEmoji}>🤝</Text>
          <Text style={styles.stillNeedHelpTitle}>Still need help?</Text>
          <Text style={styles.stillNeedHelpText}>
            Our support team is available to assist you
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.primaryButtonText}>Contact Support Team</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  contactCard: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  contactBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 80,
  },
  contactEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  contactLabel: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  contactInfo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 12,
  },
  clearIcon: {
    fontSize: 16,
    color: '#9CA3AF',
    paddingLeft: 8,
  },
  topicsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  topicItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  topicItemExpanded: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicEmoji: {
    fontSize: 22,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  expandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  expandIconRotated: {
    transform: [{ rotate: '90deg' }],
    backgroundColor: '#6366F1',
  },
  expandText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  stepsContainer: {
    marginTop: 16,
  },
  stepsDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    paddingTop: 4,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  stillNeedHelp: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stillNeedHelpEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  stillNeedHelpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  stillNeedHelpText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomSpace: {
    height: 20,
  },
});

export default HelpSupportScreen;