import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import { API_CONFIG } from '../config/api';

// @ts-ignore
window.Pusher = Pusher;

class WebSocketService {
  private echo: Echo | null = null;
  private token: string | null = null;
  private reconnectTimeout: any = null;
  private isReconnecting: boolean = false;

  initialize(token: string) {
    this.token = token;

    console.log('Initializing WebSocket with config:', {
      wsHost: API_CONFIG.wsHost,
      wsPort: API_CONFIG.wsPort,
      authEndpoint: `${API_CONFIG.baseURL}/broadcasting/auth`,
    });

    this.echo = new Echo({
      broadcaster: 'reverb',
      key: API_CONFIG.wsKey,
      wsHost: API_CONFIG.wsHost,
      wsPort: API_CONFIG.wsPort,
      wssPort: API_CONFIG.wsPort,
      forceTLS: API_CONFIG.useTLS,
      enabledTransports: API_CONFIG.useTLS ? ['wss'] : ['ws'],
      disableStats: true,
      authEndpoint: `${API_CONFIG.baseURL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    // Connection event listeners
    if (this.echo.connector && this.echo.connector.pusher) {
      this.echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ WebSocket connected successfully');
      });

      this.echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('❌ WebSocket disconnected');
      });

      this.echo.connector.pusher.connection.bind('error', (error: any) => {
        console.error('❌ WebSocket error:', error);
      });
    }

    console.log('✅ WebSocket initialized');
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }
    this.token = null;
    this.isReconnecting = false;
  }

  isConnected(): boolean {
    return this.echo !== null;
  }

  subscribeToChat(
    chatUid: string,
    callbacks: {
      onMessage?: (event: any) => void;
      onStatusUpdate?: (event: any) => void;
      onMessageRead?: (event: any) => void;
    },
  ) {
    if (!this.echo) {
      console.error('❌ WebSocket not initialized');
      return null;
    }

    console.log(`📡 Subscribing to private-chat.${chatUid}`);
    const channel = this.echo.private(`chat.${chatUid}`);

    // Subscribe success
    channel.subscribed(() => {
      console.log(`✅ Successfully subscribed to chat.${chatUid}`);
    });

    // Subscribe error
    channel.error((error: any) => {
      console.error(`❌ Subscription error for chat.${chatUid}:`, error);
    });

    if (callbacks.onMessage) {
      channel.listen('.ChatMessageCreated', (event: any) => {
        console.log('📨 Received ChatMessageCreated:', event);
        callbacks.onMessage(event);
      });
    }

    if (callbacks.onStatusUpdate) {
      channel.listen('.ChatStatusUpdated', (event: any) => {
        console.log('🔄 Received ChatStatusUpdated:', event);
        callbacks.onStatusUpdate(event);
      });
    }

    if (callbacks.onMessageRead) {
      channel.listen('.ChatMessageRead', (event: any) => {
        console.log('👁️ Received ChatMessageRead:', event);
        callbacks.onMessageRead(event);
      });
    }

    console.log(`✅ Listeners registered for chat.${chatUid}`);
    return channel;
  }

  unsubscribeFromChat(chatUid: string) {
    if (this.echo) {
      this.echo.leave(`chat.${chatUid}`);
      console.log(`Unsubscribed from chat.${chatUid}`);
    }
  }

  reconnect() {
    if (this.isReconnecting) {
      console.log('🔄 Already reconnecting, skipping...');
      return;
    }

    if (!this.token) {
      console.error('❌ Cannot reconnect: no token available');
      return;
    }

    this.isReconnecting = true;
    console.log('🔄 Reconnecting WebSocket...');

    // Disconnect current connection
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }

    // Wait a bit before reconnecting
    this.reconnectTimeout = setTimeout(() => {
      this.initialize(this.token!);
      this.isReconnecting = false;
      console.log('✅ WebSocket reconnected');
    }, 1000);
  }

  getConnectionState(): string {
    if (!this.echo || !this.echo.connector || !this.echo.connector.pusher) {
      return 'disconnected';
    }
    return this.echo.connector.pusher.connection.state;
  }
}

export default new WebSocketService();
