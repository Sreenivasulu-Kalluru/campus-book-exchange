// src/context/SocketHandler.tsx
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSocketStore } from '../store/socketStore';
import toast from 'react-hot-toast';
import type { Message } from '../types';
import type { AuthState } from '../store/authStore'; // Import the type

const SocketHandler = () => {
  const queryClient = useQueryClient();
  const { setSocket } = useSocketStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE_URL, {
      autoConnect: false,
    });
    socketRef.current = socket;
    setSocket(socket);

    // --- Listeners ---
    socket.on('new_notification', (notification) => {
      console.log('Socket: Received "new_notification"');
      useNotificationStore.getState().addNotification(notification);
      toast.success(`New request from ${notification.requesterName}!`, {
        icon: '🔔',
      });
    });

    socket.on('new_conversation', () => {
      console.log('Socket: Received "new_conversation", invalidating inbox.');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    socket.on('receiveMessage', (newMessage: Message) => {
      console.log('Socket: Received "receiveMessage"');
      const currentUserId = useAuthStore.getState().user?._id;

      queryClient.setQueryData(
        ['messages', newMessage.conversationId],
        (oldData: Message[] | undefined) => {
          if (!oldData) return [newMessage];

          // 1. Check if we already have this EXACT message (by _id) to prevent double-inserts
          if (oldData.some((msg) => msg._id === newMessage._id)) {
            return oldData;
          }

          // 2. If WE sent it, look for the optimistic version to replace
          if (currentUserId && newMessage.sender === currentUserId) {
            // Find an optimistic message: matches sender & content, but has a different ID
            // We search from the end because it was likely just added
            const optimisticIndex = [...oldData]
              .reverse()
              .findIndex(
                (msg) =>
                  msg.sender === currentUserId &&
                  msg.content === newMessage.content &&
                  msg._id !== newMessage._id
              );

            if (optimisticIndex !== -1) {
              // Calculate the actual index in the original array
              const actualIndex = oldData.length - 1 - optimisticIndex;

              // Replace the optimistic message with the real one
              const newData = [...oldData];
              newData[actualIndex] = newMessage;
              return newData;
            }
          }

          // 3. Otherwise, just append it
          return [...oldData, newMessage];
        }
      );
    });

    socket.on('connect', () => {
      console.log('Socket: Connected');
    });
    socket.on('disconnect', () => {
      console.log('Socket: Disconnected');
    });
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // --- Auth Subscription ---
    const unsubscribe = useAuthStore.subscribe(
      (state: AuthState, prevState: AuthState) => {
        if (state.isAuth === prevState.isAuth) {
          return; // No change
        }

        if (state.isAuth) {
          console.log('Socket: Auth state changed to logged in, connecting...');
          socket.connect();
          const user = state.user;
          if (user) {
            socket.emit('join', user._id);
          }
        } else {
          console.log(
            'Socket: Auth state changed to logged out, disconnecting...'
          );
          socket.disconnect();
        }
      }
    );

    // --- Initial Check ---
    const initialState = useAuthStore.getState();
    if (initialState.isAuth && initialState.user) {
      console.log('Socket: User already logged in, connecting...');
      socket.connect();
      socket.emit('join', initialState.user._id);
    }

    // --- Cleanup ---
    return () => {
      unsubscribe();
      if (socket) {
        socket.disconnect();
      }
    };
  }, [queryClient, setSocket]);

  return null;
};

export default SocketHandler;
