// src/store/notificationStore.ts
import { create } from 'zustand';

type Notification = {
  message: string;
  bookId: string;
  requesterName: string;
};

type NotificationState = {
  notifications: Notification[];
  hasUnread: boolean;
  addNotification: (notification: Notification) => void;
  markAsRead: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  hasUnread: false,

  // Action to add a new notification
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications], // Add to top
      hasUnread: true,
    })),

  // Action to mark all as read
  markAsRead: () => set({ hasUnread: false }),
}));
