// src/services/chatService.ts
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { Conversation, Message } from '../types';

/**
 * Gets all of the user's conversations (their inbox).
 */
export const getMyConversations = async (): Promise<Conversation[]> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authorized');

  const response = await api.get('/chat', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Gets all messages for a single conversation.
 */
export const getMessages = async (
  conversationId: string
): Promise<Message[]> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authorized');

  const response = await api.get(`/chat/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Gets the details for a single conversation.
 */
export const getConversationDetails = async (
  conversationId: string
): Promise<Conversation> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authorized');

  const response = await api.get(`/chat/details/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
