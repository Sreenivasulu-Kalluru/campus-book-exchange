// src/store/uiStore.ts
import { create } from 'zustand';

type UIState = {
  isListBookModalOpen: boolean;
  openListBookModal: () => void;
  closeListBookModal: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isListBookModalOpen: false,
  openListBookModal: () => set({ isListBookModalOpen: true }),
  closeListBookModal: () => set({ isListBookModalOpen: false }),
}));
