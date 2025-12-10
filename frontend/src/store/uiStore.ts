// src/store/uiStore.ts
import { create } from 'zustand';

import type { Book } from '../types'; // Import Book type

type UIState = {
  isListBookModalOpen: boolean;
  bookToEdit: Book | null; // <-- Added
  openListBookModal: (book?: Book) => void; // <-- Updated signature
  closeListBookModal: () => void;

  isBookPreviewModalOpen: boolean;
  bookPreviewUrl: string | null;
  openBookPreviewModal: (url: string) => void;
  closeBookPreviewModal: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isListBookModalOpen: false,
  bookToEdit: null,
  openListBookModal: (book) =>
    set({ isListBookModalOpen: true, bookToEdit: book || null }),
  closeListBookModal: () =>
    set({ isListBookModalOpen: false, bookToEdit: null }),

  // Book Preview Modal
  isBookPreviewModalOpen: false,
  bookPreviewUrl: null,
  openBookPreviewModal: (url: string) =>
    set({ isBookPreviewModalOpen: true, bookPreviewUrl: url }),
  closeBookPreviewModal: () =>
    set({ isBookPreviewModalOpen: false, bookPreviewUrl: null }),
}));
