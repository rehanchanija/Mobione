import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { showMessage } from 'react-native-flash-message';

type MessageType = 'success' | 'danger' | 'info';

interface LocalMessage {
  id: string;
  type: MessageType;
  title?: string;
  description: string;
}

export const useFlashMessage = () => {
  const [messages, setMessages] = useState<LocalMessage[]>([]);

  const push = useCallback((type: MessageType, description: string, title?: string) => {
    const id = String(Date.now() + Math.random());
    setMessages((prev) => [{ id, type, title, description }, ...prev]);
    showMessage({ message: title || (type === 'success' ? 'Success' : type === 'danger' ? 'Error' : 'Info'), description, type });
  }, []);

  const dismissMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const showSuccess = useCallback((description: string, title?: string) => push('success', description, title), [push]);
  const showError = useCallback((description: string, title?: string) => push('danger', description, title), [push]);
  const showInfo = useCallback((description: string, title?: string) => push('info', description, title), [push]);

  return { messages, dismissMessage, showSuccess, showError, showInfo };
};

export const FlashMessageContainer = ({ messages, onDismiss }: { messages: LocalMessage[]; onDismiss: (id: string) => void }) => {
  if (!messages || messages.length === 0) return null;
  return (
    <View style={styles.container}>
      {messages.map((m) => (
        <View key={m.id} style={[styles.card, m.type === 'success' ? styles.success : m.type === 'danger' ? styles.error : styles.info]}>
          {m.title ? <Text style={styles.title}>{m.title}</Text> : null}
          <Text style={styles.desc}>{m.description}</Text>
          <TouchableOpacity onPress={() => onDismiss(m.id)}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  success: { backgroundColor: '#E8F5E9' },
  error: { backgroundColor: '#FEE2E2' },
  info: { backgroundColor: '#E0E7FF' },
  title: { fontWeight: '700', color: '#111827', marginRight: 8 },
  desc: { flex: 1, color: '#374151' },
  close: { color: '#6B7280', fontWeight: '700' },
});

