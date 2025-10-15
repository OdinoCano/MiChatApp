import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import { API_CONFIG } from '../config/api';

// @ts-ignore
window.Pusher = Pusher;

class WebSocketService {
  private echo: Echo | null = null;
  private token: string | null = null;

  initialize(token: string) {
    this.token = token;

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

    console.log('WebSocket initialized');
  }

  disconnect() {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }
    this.token = null;
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
      console.error('WebSocket not initialized');
      return null;
    }

    const channel = this.echo.private(`chat.${chatUid}`);

    if (callbacks.onMessage) {
      channel.listen('.ChatMessageCreated', callbacks.onMessage);
    }

    if (callbacks.onStatusUpdate) {
      channel.listen('.ChatStatusUpdated', callbacks.onStatusUpdate);
    }

    if (callbacks.onMessageRead) {
      channel.listen('.ChatMessageRead', callbacks.onMessageRead);
    }

    console.log(`Subscribed to chat.${chatUid}`);
    return channel;
  }

  unsubscribeFromChat(chatUid: string) {
    if (this.echo) {
      this.echo.leave(`chat.${chatUid}`);
      console.log(`Unsubscribed from chat.${chatUid}`);
    }
  }
}

export default new WebSocketService();
