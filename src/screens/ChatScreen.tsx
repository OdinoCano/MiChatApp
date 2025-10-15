import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import apiService from '../services/api';
import websocketService from '../services/websocket';
import { ChatMessage, ChatEvent, ChatStatus } from '../types/chat';
import colors from '../theme/colors';

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
    if (!chatUid) {
      console.log('⚠️ Cannot subscribe: chatUid not set');
      return;
    }

    if (!websocketService.isConnected()) {
      console.log('⚠️ Cannot subscribe: WebSocket not connected');
      return;
    }

    console.log(`🔌 Attempting to subscribe to chat ${chatUid}`);
    const channel = websocketService.subscribeToChat(chatUid, {
      onMessage: handleNewMessage,
      onStatusUpdate: handleStatusUpdate,
      onMessageRead: handleMessageRead,
    });

    return () => {
      if (chatUid) {
        console.log(`🔌 Unsubscribing from chat ${chatUid}`);
        websocketService.unsubscribeFromChat(chatUid);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Load messages
      const messages = await apiService.getChatMessages(chatId);
      console.log(`📥 Loaded ${messages.length} messages from chat ${chatId}`);
      setMessages(messages);

      // Auto-scroll to bottom after loading
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
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

      // Check if message already exists to avoid duplicates
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) {
          console.log(`⚠️ Message ${newMessage.id} already exists, skipping`);
          return prev;
        }
        console.log(`📨 Adding new message ${newMessage.id} to chat`);
        return [...prev, newMessage];
      });

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

  // Handle app state changes for reconnection
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log(`📱 App state changed to: ${nextAppState}`);
      
      if (nextAppState === 'active') {
        console.log('🔄 App became active, checking WebSocket connection...');
        const state = websocketService.getConnectionState();
        console.log(`WebSocket state: ${state}`);
        
        if (state !== 'connected' && chatUid) {
          console.log('🔌 Reconnecting WebSocket and resubscribing...');
          websocketService.reconnect();
          
          // Wait for reconnection then resubscribe
          setTimeout(() => {
            if (websocketService.isConnected()) {
              websocketService.subscribeToChat(chatUid, {
                onMessage: handleNewMessage,
                onStatusUpdate: handleStatusUpdate,
                onMessageRead: handleMessageRead,
              });
              console.log('✅ Resubscribed to chat after reconnection');
            }
          }, 1500);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [chatUid, handleNewMessage, handleStatusUpdate, handleMessageRead]);

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

      // Add message immediately (WebSocket will be handled by handleNewMessage with duplicate check)
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (!exists) {
          console.log(`✅ Message sent: ${newMessage.id}`);
          return [...prev, newMessage];
        }
        return prev;
      });

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
      [ChatStatus.Pending]: 'PENDIENTE',
      [ChatStatus.Accepted]: 'ACTIVO',
      [ChatStatus.Rejected]: 'CERRADO',
    };

    const statusColors = {
      [ChatStatus.Pending]: colors.secondary,
      [ChatStatus.Accepted]: colors.success,
      [ChatStatus.Rejected]: colors.error,
    };

    return (
      <View
        style={[styles.statusBadge, { backgroundColor: statusColors[chatStatus] }]}>
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

  // Client can send messages even in pending status to start conversation
  const isChatActive = chatStatus === ChatStatus.Accepted || chatStatus === ChatStatus.Pending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CONVERSACIÓN</Text>
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
              {chatStatus === ChatStatus.Rejected
                ? 'Este chat ha sido rechazado'
                : chatStatus === ChatStatus.Pending
                ? 'Envía un mensaje para iniciar la conversación. Un asesor te responderá pronto.'
                : 'Comienza la conversación enviando el primer mensaje'}
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
          chatStatus === ChatStatus.Rejected
            ? 'Chat rechazado'
            : 'Escribe un mensaje...'
        }
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 2,
  },
  statusText: {
    color: colors.textWhite,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: 16,
    backgroundColor: colors.backgroundGray,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
  },
});

export default ChatScreen;
