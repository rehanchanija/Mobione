import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Notification {
  id: string;
  emoji: string;
  title: string;
  message: string;
  time: string;
}

const notifications: Notification[] = [
  {
    id: "1",
    emoji: "📦",
    title: "New Order",
    message: "You received a new order for iPhone 15 Pro.",
    time: "2m ago",
  },
  {
    id: "2",
    emoji: "💰",
    title: "Payment Received",
    message: "₹45,250 credited from today's sales.",
    time: "10m ago",
  },
  {
    id: "3",
    emoji: "👤",
    title: "New Customer",
    message: "John Doe joined as a new customer.",
    time: "1h ago",
  },
  {
    id: "4",
    emoji: "⚠️",
    title: "Low Stock",
    message: "Only 3 units left for Samsung Galaxy S23.",
    time: "3h ago",
  },
];

const NotificationScreen = () => {
   const navigate=useNavigation()
  const renderItem = ({ item }: { item: Notification }) => (
    <View style={styles.card}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
    <View style={styles.customHeader}>
           <TouchableOpacity style={styles.backButton} onPress={navigate.goBack}>
             <Text style={styles.backArrow}>←</Text>
           </TouchableOpacity>
           <View style={styles.headerCenter}>
             <Text style={styles.headerTitle}>Notification</Text>
           </View>
         </View>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  message: {
    fontSize: 14,
    color: "#4B5563",
    marginVertical: 4,
  },
  time: {
    fontSize: 12,
    color: "#9CA3AF",
  },
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
    backgroundColor: '#f3f4f6b2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#374151',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
});
