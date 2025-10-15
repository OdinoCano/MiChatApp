import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api';
import { Chat, ChatMessage, LoginResponse } from '../types/chat';

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
  async login(email: string, password: string, deviceName: string = 'android-app'): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/login', { 
      email, 
      password,
      device_name: deviceName
    });
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
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

  async createChat(subject?: string): Promise<Chat> {
    const response = await this.api.post('/chats', { subject });
    return response.data.data || response.data;
  }

  // Messages
  async getChatMessages(chatId: number): Promise<ChatMessage[]> {
    const response = await this.api.get(`/chats/${chatId}/messages`);
    return response.data;
  }

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
