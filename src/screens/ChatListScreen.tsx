import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api';
import { Chat, ChatStatus } from '../types/chat';
import colors from '../theme/colors';

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const data = await apiService.getChats();
      setChats(data);
    } catch (error) {
      console.error('Error loading chats:', error);
      Alert.alert('Error', 'No se pudieron cargar los chats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const handleChatPress = (chat: Chat) => {
    navigation.navigate('Chat' as never, { chatId: chat.id } as never);
  };

  const handleCreateChat = async () => {
    Alert.alert(
      'Nuevo Chat',
      '¿Deseas iniciar una conversación con un asesor?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Crear Chat',
          onPress: async () => {
            setCreating(true);
            try {
              const newChat = await apiService.createChat('Consulta de asesoría');
              // Recargar la lista de chats
              await loadChats();
              // Navegar al nuevo chat
              navigation.navigate('Chat' as never, { chatId: newChat.id } as never);
            } catch (error: any) {
              console.error('Error creating chat:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'No se pudo crear el chat'
              );
            } finally {
              setCreating(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusColor = (status: ChatStatus) => {
    switch (status) {
      case ChatStatus.Accepted:
        return colors.success;
      case ChatStatus.Rejected:
        return colors.error;
      default:
        return colors.secondary;
    }
  };

  const getStatusLabel = (status: ChatStatus) => {
    switch (status) {
      case ChatStatus.Accepted:
        return 'ACTIVO';
      case ChatStatus.Rejected:
        return 'CERRADO';
      default:
        return 'PENDIENTE';
    }
  };

  const renderChat = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}>
      <View style={styles.chatContent}>
        <Text style={styles.chatTitle}>
          {item.assessor ? item.assessor.name : 'Chat pendiente'}
        </Text>
        <Text style={styles.chatSubtitle}>
          Cliente: {item.client?.name || 'Desconocido'}
        </Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) },
        ]}>
        <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b5de7" />
        <Text style={styles.loadingText}>Cargando chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>MiChatApp</Text>
          <Text style={styles.headerSubtitle}>Conversaciones</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>SALIR</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tienes chats activos</Text>
            <Text style={styles.emptySubtext}>Presiona + para iniciar una conversación</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateChat}
        disabled={creating}>
        {creating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.fabText}>+</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 24,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textWhite,
    letterSpacing: 3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.secondary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 2,
  },
  logoutText: {
    color: colors.textWhite,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 2,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  chatSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 2,
  },
  statusText: {
    color: colors.textWhite,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 64,
    height: 64,
    borderRadius: 2,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  fabText: {
    fontSize: 40,
    color: colors.textWhite,
    fontWeight: '200',
    lineHeight: 44,
  },
});

export default ChatListScreen;
