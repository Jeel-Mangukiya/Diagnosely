// types/chat.types.ts

import { Tables } from './types';

export type ChatMessage = Tables<'chat_messages'>;

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatError {
  message: string;
  code?: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  sender: 'user' | 'ai';
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      chat_sessions: {
        Row: ChatSession;
        Insert: Omit<ChatSession, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ChatSession, 'id'>>;
      };
      chat_messages: {
        Row: DatabaseChatMessage;
        Insert: Omit<DatabaseChatMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseChatMessage, 'id'>>;
      };
    };
  };
}