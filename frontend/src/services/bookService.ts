// src/services/bookService.ts
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
// --- 1. IMPORT ApiError from types.ts ---
import type { Book, CreateBookData, ApiError } from '../types';

// --- 2. EXPORT ApiError so other files can import it ---
export type { ApiError };

// --- BookQuery type (for search) ---
export type BookQuery = {
  search?: string;
  condition?: string;
  department?: string;
};

/**
 * Fetches all available books, with optional search/filter queries.
 */
export const getAllBooks = async (query: BookQuery): Promise<Book[]> => {
  const response = await api.get('/books', {
    params: query,
  });
  return response.data;
};

/**
 * Fetches a single book by its ID.
 */
export const getBookById = async (bookId: string): Promise<Book> => {
  const response = await api.get(`/books/${bookId}`);
  return response.data;
};

/**
 * Fetches all 'Available' books listed by the current user.
 */
export const getMyListings = async (): Promise<Book[]> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authorized');

  const response = await api.get('/books/my-listings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Fetches all 'Sold' books listed by the current user.
 */
export const getMyHistory = async (): Promise<Book[]> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authorized');

  const response = await api.get('/books/my-history', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Creates a new book listing.
 */
export const createBook = async (data: CreateBookData): Promise<Book> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authorized');

  const response = await api.post('/books', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
