import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api';
import { Chat, ChatMessage } from '../types/chat';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.apiURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor para agregar token
    this.api.interceptors.request.use(
      config => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.api.post('/login', { email, password });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async logout() {
    await this.api.post('/logout');
    this.clearToken();
  }

  async getUser() {
    const response = await this.api.get('/user');
    return response.data;
  }

  // Chats
  async getChats(): Promise<Chat[]> {
    const response = await this.api.get('/chats');
    return response.data.data || response.data;
  }

  async getChat(chatId: number): Promise<Chat> {
    const response = await this.api.get(`/chats/${chatId}`);
    return response.data.data || response.data;
  }

  async createChat(clientId: number): Promise<Chat> {
    const response = await this.api.post('/chats', { client_id: clientId });
    return response.data.data || response.data;
  }

  // Messages
  async sendMessage(chatId: number, message: string): Promise<ChatMessage> {
    const response = await this.api.post(`/chats/${chatId}/messages`, {
      message,
    });
    return response.data;
  }

  async markMessageAsRead(
    chatId: number,
    messageId: number,
  ): Promise<ChatMessage> {
    const response = await this.api.patch(
      `/chats/${chatId}/messages/${messageId}/read`,
    );
    return response.data;
  }
}

export default new ApiService();
