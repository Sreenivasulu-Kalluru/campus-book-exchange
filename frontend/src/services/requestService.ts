// src/services/requestService.ts
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { BookRequest, PopulatedRequest, ApiError } from '../types';

// Re-export the ApiError type so other files can import it from here
export type { ApiError };

// --- Type Definitions ---

type CreateRequestData = {
  bookId: string;
  message?: string;
};

type RespondRequestData = {
  requestId: string;
  status: 'Accepted' | 'Declined';
};

// --- Service Functions ---

/**
 * Creates a new exchange request.
 */
export const createRequest = async (
  data: CreateRequestData
): Promise<BookRequest> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('You are not authorized. Please log in.');

  const response = await api.post('/requests', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Gets all requests *received* by the logged-in user.
 */
export const getReceivedRequests = async (): Promise<PopulatedRequest[]> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authorized');

  const response = await api.get('/requests/received', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Responds to a received request (Accept/Decline).
 */
export const respondToRequest = async ({
  requestId,
  status,
}: RespondRequestData): Promise<BookRequest> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authorized');

  const response = await api.put(
    `/requests/${requestId}`,
    { status }, // This is the body
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

/**
 * Gets all requests *sent* by the logged-in user.
 */
export const getSentRequests = async (): Promise<PopulatedRequest[]> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authorized');

  const response = await api.get('/requests/sent', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Checks the status of a request for a specific book.
 */
export const checkRequestStatus = async (
  bookId: string
): Promise<{ status: 'Pending' | 'Accepted' | 'Declined' | null }> => {
  const token = useAuthStore.getState().token;
  if (!token) return { status: null }; // Not logged in, no status

  try {
    const response = await api.get(`/requests/check/${bookId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch {
    return { status: null };
  }
};
