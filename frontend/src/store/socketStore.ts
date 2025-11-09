// src/store/socketStore.ts
import { create } from 'zustand';
import { type Socket } from 'socket.io-client';

type SocketState = {
  socket: Socket | null;
  setSocket: (socket: Socket) => void;
};

// This store will just hold the socket instance
export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  setSocket: (socket) => set({ socket }),
}));
