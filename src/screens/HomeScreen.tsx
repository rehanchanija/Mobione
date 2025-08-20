import React from "react";
import { SafeAreaView, Text, StyleSheet, View } from "react-native";

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📱 Phone Store</Text>
        <Text style={styles.subtitle}>Welcome! Browse the latest phones.</Text>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    color: "gray",
  },
});
