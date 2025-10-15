import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../types/chat';
import colors from '../theme/colors';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwnMessage }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}>
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}>
        {!isOwnMessage && message.sender && (
          <Text style={styles.senderName}>{message.sender.name}</Text>
        )}
        <Text
          style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}>
          {message.body}
        </Text>
        <Text
          style={[
            styles.timestamp,
            isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
          ]}>
          {formatTime(message.created_at)}
          {isOwnMessage && message.read_at && ' ✓✓'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 6,
    marginHorizontal: 16,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ownMessage: {
    backgroundColor: colors.messageSent,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
  },
  otherMessage: {
    backgroundColor: colors.messageReceived,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  ownMessageText: {
    color: colors.textWhite,
  },
  otherMessageText: {
    color: colors.text,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  ownTimestamp: {
    color: colors.textWhite,
    opacity: 0.7,
    textAlign: 'right',
  },
  otherTimestamp: {
    color: colors.textLight,
    textAlign: 'left',
  },
});

export default ChatBubble;
