import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import apiService from '../services/api';
import websocketService from '../services/websocket';
import { ChatMessage, ChatEvent, ChatStatus } from '../types/chat';

type ChatScreenRouteProp = RouteProp<{ Chat: { chatId: number } }, 'Chat'>;

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { chatId } = route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatUid, setChatUid] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [chatStatus, setChatStatus] = useState<ChatStatus>(ChatStatus.Pending);

  const flatListRef = useRef<FlatList>(null);

  // Load chat data
  useEffect(() => {
    loadChatData();
  }, [chatId]);

  // Subscribe to WebSocket
  useEffect(() => {
    if (!chatUid || !websocketService.isConnected()) {
      return;
    }

    const channel = websocketService.subscribeToChat(chatUid, {
      onMessage: handleNewMessage,
      onStatusUpdate: handleStatusUpdate,
      onMessageRead: handleMessageRead,
    });

    return () => {
      if (chatUid) {
        websocketService.unsubscribeFromChat(chatUid);
      }
    };
  }, [chatUid]);

  const loadChatData = async () => {
    try {
      setLoading(true);

      // Get current user
      const user = await apiService.getUser();
      setCurrentUserId(user.id);

      // Get chat
      const chat = await apiService.getChat(chatId);
      setChatUid(chat.uid);
      setChatStatus(chat.status);

      // In a real app, you'd fetch messages from the API
      // For now, we'll start with an empty array
      setMessages([]);
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = useCallback((event: ChatEvent) => {
    if (event.type === 'message') {
      const newMessage: ChatMessage = {
        id: event.message_id || 0,
        chat_id: event.chat_id,
        chat_uid: event.chat_uid,
        body: event.body || '',
        sender_id: event.sender?.id || 0,
        sender: event.sender,
        created_at: event.created_at || new Date().toISOString(),
      };

      setMessages(prev => [...prev, newMessage]);

      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Mark as read if not from current user
      if (newMessage.sender_id !== currentUserId) {
        markAsRead(newMessage.id);
      }
    }
  }, [currentUserId]);

  const handleStatusUpdate = useCallback((event: ChatEvent) => {
    if (event.status) {
      setChatStatus(event.status);
    }
  }, []);

  const handleMessageRead = useCallback((event: ChatEvent) => {
    if (event.message_id) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === event.message_id
            ? { ...msg, read_at: event.read_at || new Date().toISOString() }
            : msg,
        ),
      );
    }
  }, []);

  const sendMessage = async (messageText: string) => {
    try {
      const sentMessage = await apiService.sendMessage(chatId, messageText);

      const newMessage: ChatMessage = {
        id: sentMessage.id,
        chat_id: sentMessage.chat_id,
        body: sentMessage.body || messageText,
        sender_id: currentUserId,
        created_at: sentMessage.created_at || new Date().toISOString(),
      };

      setMessages(prev => [...prev, newMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      await apiService.markMessageAsRead(chatId, messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <ChatBubble
      message={item}
      isOwnMessage={item.sender_id === currentUserId}
    />
  );

  const getStatusBadge = () => {
    const labels = {
      [ChatStatus.Pending]: 'Pendiente',
      [ChatStatus.Accepted]: 'Aceptado',
      [ChatStatus.Rejected]: 'Rechazado',
    };

    const colors = {
      [ChatStatus.Pending]: '#ffc107',
      [ChatStatus.Accepted]: '#28a745',
      [ChatStatus.Rejected]: '#dc3545',
    };

    return (
      <View
        style={[styles.statusBadge, { backgroundColor: colors[chatStatus] }]}>
        <Text style={styles.statusText}>{labels[chatStatus]}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b5de7" />
        <Text style={styles.loadingText}>Cargando chat...</Text>
      </View>
    );
  }

  const isChatActive = chatStatus === ChatStatus.Accepted;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat en vivo</Text>
        {getStatusBadge()}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {isChatActive
                ? 'Comienza la conversación enviando el primer mensaje'
                : 'Esperando que se acepte el chat...'}
            </Text>
          </View>
        }
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />

      <ChatInput
        onSend={sendMessage}
        disabled={!isChatActive}
        placeholder={
          isChatActive
            ? 'Escribe un mensaje...'
            : 'Chat no disponible'
        }
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default ChatScreen;
