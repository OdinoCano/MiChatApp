export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  chat_uid?: string;
  message_id?: number;
  body: string;
  sender_id: number;
  sender?: User;
  created_at: string;
  read_at?: string | null;
  type?: 'message' | 'status' | 'read';
}

export enum ChatStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

export interface Chat {
  id: number;
  uid: string;
  client_id: number;
  assessor_id?: number;
  status: ChatStatus;
  accepted_at?: string | null;
  rejected_at?: string | null;
  client?: User;
  assessor?: User;
}

export interface ChatEvent {
  type: 'message' | 'status' | 'read';
  chat_id: number;
  chat_uid: string;
  message_id?: number;
  body?: string;
  sender?: User;
  created_at?: string;
  status?: ChatStatus;
  accepted_at?: string | null;
  rejected_at?: string | null;
  assessor?: User;
  client?: User;
  read_at?: string | null;
}
