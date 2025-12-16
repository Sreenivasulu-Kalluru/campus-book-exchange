// src/context/SocketHandler.tsx
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSocketStore } from '../store/socketStore';
import toast from 'react-hot-toast';
import type { Message, Notification } from '../types';

const SocketHandler = () => {
  const queryClient = useQueryClient();
  const { setSocket } = useSocketStore();
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);

  // Initialize socket ONLY ONCE using a ref check
  if (!socketRef.current) {
    const socket = io(
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
      {
        autoConnect: false,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      }
    );
    socketRef.current = socket;
    // We set the socket in the store, but since we are inside the render loop here for init,
    // we should be careful. Ideally, do this in an effect, but this ensures safe singleton creation.
    // To avoid side-effects during render, we'll actually defer the setSocket to the effect.
  }

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Set the global socket state once
    setSocket(socket);

    // --- Define Event Handlers ---
    const onConnect = () => {
      console.log('Socket: Connected');
      isConnectingRef.current = false;
    };

    const onDisconnect = (reason: string) => {
      console.log('Socket: Disconnected, reason:', reason);
      isConnectingRef.current = false;
    };

    const onConnectError = (err: Error) => {
      console.error('Socket: Connection error:', err.message);
      isConnectingRef.current = false;
    };

    const onNewNotification = (notification: Notification) => {
      console.log('Socket: Received "new_notification"');
      useNotificationStore.getState().addNotification(notification);
      toast.success(`New request from ${notification.requesterName}!`, {
        icon: '🔔',
      });
    };

    const onNewConversation = () => {
      console.log('Socket: Received "new_conversation", invalidating inbox.');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const onReceiveMessage = (newMessage: Message) => {
      console.log('Socket: Received "receiveMessage"', newMessage._id);
      const currentUserId = useAuthStore.getState().user?._id;

      queryClient.setQueryData(
        ['messages', newMessage.conversationId],
        (oldData: Message[] | undefined) => {
          if (!oldData) return [newMessage];

          // 1. Dedup: Check if we already have this EXACT message
          if (oldData.some((msg) => msg._id === newMessage._id)) {
            return oldData;
          }

          // 2. Sender optimistic update reconciliation
          if (currentUserId && newMessage.sender === currentUserId) {
            const optimisticIndex = [...oldData]
              .reverse()
              .findIndex(
                (msg) =>
                  msg.sender === currentUserId &&
                  msg.content === newMessage.content &&
                  msg._id !== newMessage._id
              );

            if (optimisticIndex !== -1) {
              const actualIndex = oldData.length - 1 - optimisticIndex;
              const newData = [...oldData];
              newData[actualIndex] = newMessage;
              return newData;
            }
          }

          // 3. Append
          return [...oldData, newMessage];
        }
      );
    };

    // --- Attach Listeners ---
    // Remove existing to be safe (though this runs once usually)
    socket.off('connect', onConnect);
    socket.off('disconnect', onDisconnect);
    socket.off('connect_error', onConnectError);
    socket.off('new_notification', onNewNotification);
    socket.off('new_conversation', onNewConversation);
    socket.off('receiveMessage', onReceiveMessage);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('new_notification', onNewNotification);
    socket.on('new_conversation', onNewConversation);
    socket.on('receiveMessage', onReceiveMessage);

    // --- Auth State Management ---
    // We subscribe manually to avoid re-running this effect on every auth change
    const unsubscribeAuth = useAuthStore.subscribe((state, prevState) => {
      const socket = socketRef.current;
      if (!socket) return;

      if (state.isAuth && state.user) {
        // If user logged in and we aren't connected, connect
        if (!socket.connected && !isConnectingRef.current) {
          console.log('Socket: Auth detected, connecting...');
          isConnectingRef.current = true;
          socket.connect();
          socket.emit('join', state.user._id);
        } else if (socket.connected && state.user._id !== prevState.user?._id) {
          // User changed, re-join
          socket.emit('join', state.user._id);
        }
      } else if (!state.isAuth && socket.connected) {
        console.log('Socket: Logout detected, disconnecting...');
        socket.disconnect();
      }
    });

    // --- Initial Connect Check ---
    const { isAuth, user } = useAuthStore.getState();
    if (isAuth && user && !socket.connected && !isConnectingRef.current) {
      console.log('Socket: Initial connect...');
      isConnectingRef.current = true;
      socket.connect();
      socket.emit('join', user._id);
    }

    // --- Cleanup ---
    return () => {
      unsubscribeAuth();
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('new_notification', onNewNotification);
      socket.off('new_conversation', onNewConversation);
      socket.off('receiveMessage', onReceiveMessage);

      // We do NOT disconnect on unmount in development to avoid flickers with StrictMode,
      // but in a real app you might want to.
      // Given the user's issue with frequent disconnects, let's keep it alive
      // unless valid logout happens.
      // socket.disconnect();
    };
  }, [queryClient, setSocket]); // Dependencies are stable

  return null;
};

export default SocketHandler;
