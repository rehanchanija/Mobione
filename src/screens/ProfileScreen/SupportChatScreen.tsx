import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, TextInput, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';

export default function SupportChatScreen() {
  const navigation = useNavigation();
  const [input, setInput] = useState('');
  type Message = {
  id: string;
  sender: 'user' | 'owner';
  text: string;
  time: number;
};
const [messages, setMessages] = useState<{ 
  id: string; 
  sender: 'user' | 'owner'; 
  text: string; 
  time: number; 
}[]>([]);

  const handleBack = () => {
    navigation.goBack();
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
const msg = {
  id: String(Date.now()),
  sender: 'user' as const,
  text,
  time: Date.now(),
};
setMessages(prev => [...prev, msg]);

   
setMessages(prev => [...prev, msg]);
    setInput('');
    showMessage({ message: 'Message sent', type: 'success' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Support</Text>
      </View>

      <FlatList
        style={styles.list}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.bubbleUser : styles.bubbleOwner]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={send}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 16,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backArrow: { fontSize: 20, color: '#374151', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingVertical: 12 },
  bubble: {
    maxWidth: '80%',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#6366F1' },
  bubbleOwner: { alignSelf: 'flex-start', backgroundColor: '#E5E7EB' },
  bubbleText: { color: '#111827' },
  inputRow: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '700' },
});
