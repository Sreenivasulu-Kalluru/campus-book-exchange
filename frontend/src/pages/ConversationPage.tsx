// src/pages/ConversationPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMessages, getConversationDetails } from '../services/chatService';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { Send, Loader2, ArrowLeft, User } from 'lucide-react';
import type { Conversation, Message } from '../types';

/**
 * The main Conversation page.
 */
const ConversationPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?._id);
  const socket = useSocketStore((state) => state.socket);

  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // --- 1. Actively fetch conversation details ---
  // This is the fix for the "reload" bug.
  const {
    data: conversation,
    isLoading: isConvoLoading,
    isError: isConvoError,
  } = useQuery<Conversation>({
    queryKey: ['conversation', id],
    queryFn: () => getConversationDetails(id!),
    enabled: !!id,
    // We can use the cache from the InboxPage if it's there
    initialData: () => {
      const conversations = queryClient.getQueryData<Conversation[]>([
        'conversations',
      ]);
      return conversations?.find((c) => c._id === id);
    },
  });

  // --- 2. Fetch messages (unchanged) ---
  const { data: messages, isLoading: areMessagesLoading } = useQuery<Message[]>(
    {
      queryKey: ['messages', id],
      queryFn: () => getMessages(id!),
      enabled: !!id,
    }
  );

  // --- 3. Find the 'other user' (now safe) ---
  const otherUser =
    conversation?.participants.find((p) => p._id !== currentUserId) || null;

  // --- 4. Auto-scroll to bottom ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- 5. Handle Sending a Message ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !id || !currentUserId || !otherUser)
      return;

    // Optimistic Update (for the sender)
    const tempMessage: Message = {
      _id: Math.random().toString(),
      conversationId: id,
      sender: currentUserId,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData(
      ['messages', id],
      (oldData: Message[] | undefined) => {
        return oldData ? [...oldData, tempMessage] : [tempMessage];
      }
    );

    // Emit the real message to the server
    socket.emit('sendMessage', {
      conversationId: id,
      senderId: currentUserId,
      receiverId: otherUser._id,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  // --- 6. UPDATED Loading/Error states ---
  // This handles all 'null' checks before rendering
  if (isConvoLoading || areMessagesLoading) {
    return (
      <div className="w-full h-[calc(100vh-150px)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isConvoError || !conversation || !otherUser) {
    return (
      <div className="w-full h-[calc(100vh-150px)] flex flex-col items-center justify-center text-center">
        <p className="text-xl text-red-500">Error loading conversation.</p>
        <Link to="/inbox" className="mt-4 text-primary hover:underline">
          Go back to Inbox
        </Link>
      </div>
    );
  }

  // --- 7. Rest of the file is unchanged ---
  return (
    <div className="w-full h-[calc(100vh-150px)] flex flex-col">
      <Helmet>
        <title>Chat with {otherUser.name} - CampusBookEx</title>
        <meta
          name="description"
          content={`Conversation about the book: ${conversation.book.title}`}
        />
      </Helmet>

      {/* --- Chat Header --- */}
      <div className="flex items-center p-4 space-x-3 bg-white border-b border-gray-200 shrink-0">
        <Link to="/inbox" className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-primary" />
        </Link>
        <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-200 rounded-full">
          <User className="w-6 h-6 text-gray-500" />
        </div>
        <div>
          <p className="text-lg font-semibold text-dark-text">
            {otherUser.name}
          </p>
          <p className="text-sm text-gray-500 truncate">
            Regarding: {conversation.book.title}
          </p>
        </div>
      </div>

      {/* --- Message List --- */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
        {messages?.map((msg) => {
          const isMe = msg.sender === currentUserId;
          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-xs lg:max-w-md p-3 rounded-2xl shadow-sm
                  ${
                    isMe
                      ? 'bg-primary text-white rounded-br-lg'
                      : 'bg-white text-dark-text rounded-bl-lg'
                  }
                `}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isMe ? 'text-blue-200' : 'text-gray-400'
                  } opacity-80`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* --- Message Input Form --- */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center p-4 space-x-3 bg-white border-t border-gray-200 shrink-0"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="flex items-center justify-center w-10 h-10 text-white transition-all duration-300 rounded-full bg-primary hover:bg-blue-800 disabled:bg-gray-400"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ConversationPage;
