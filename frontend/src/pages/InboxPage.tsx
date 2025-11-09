// src/pages/InboxPage.tsx
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookMarked, Inbox } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getMyConversations } from '../services/chatService';
import { useAuthStore } from '../store/authStore';
import type { Conversation } from '../types';

/**
 * Renders a simple, elegant skeleton loader for the conversation list.
 */
const ConversationSkeleton = () => (
  <div className="flex items-center p-4 space-x-4 bg-white border rounded-lg shadow-sm animate-pulse">
    <div className="w-16 h-16 bg-gray-300 rounded-md"></div>
    <div className="flex-1 space-y-2">
      <div className="w-3/4 h-5 bg-gray-300 rounded"></div>
      <div className="w-1/2 h-4 bg-gray-300 rounded"></div>
      <div className="w-1/3 h-4 bg-gray-300 rounded"></div>
    </div>
  </div>
);

/**
 * Renders a single conversation card.
 */
type ConversationCardProps = {
  conversation: Conversation;
  currentUserId: string;
};

const ConversationCard = ({
  conversation,
  currentUserId,
}: ConversationCardProps) => {
  // Find the *other* participant in the chat
  const otherParticipant = conversation.participants.find(
    (p) => p._id !== currentUserId
  );

  return (
    <Link
      to={`/chat/${conversation._id}`}
      className="flex items-center p-4 space-x-4 transition-all duration-300 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:border-primary"
    >
      {/* Book Image or Placeholder */}
      <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-gray-100 rounded-md shrink-0">
        {conversation.book.imageUrl ? (
          <img
            src={conversation.book.imageUrl}
            alt={conversation.book.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <BookMarked className="w-8 h-8 text-gray-400" />
        )}
      </div>

      {/* Chat Details */}
      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold truncate text-primary">
          {otherParticipant ? otherParticipant.name : 'Unknown User'}
        </p>
        <p
          className="text-sm text-gray-700 truncate"
          title={conversation.book.title}
        >
          <span className="font-medium">Book:</span> {conversation.book.title}
        </p>
        <p className="text-sm text-gray-500">
          Last updated: {new Date(conversation.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
};

/**
 * The main Inbox page.
 */
const InboxPage = () => {
  const currentUserId = useAuthStore((state) => state.user?._id);

  const {
    data: conversations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: getMyConversations,
    // We only run this query if the user ID is available
    enabled: !!currentUserId,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <ConversationSkeleton />
          <ConversationSkeleton />
          <ConversationSkeleton />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center text-red-500">
          <p>Error loading your conversations.</p>
        </div>
      );
    }

    if (!conversations || conversations.length === 0) {
      return (
        <div className="p-12 text-center rounded-lg bg-gray-50">
          <Inbox className="w-16 h-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-dark-text">
            No conversations yet
          </h3>
          <p className="mt-2 text-gray-500">
            When you request a book, your conversation will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {conversations.map((convo) => (
          <ConversationCard
            key={convo._id}
            conversation={convo}
            currentUserId={currentUserId!}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Helmet>
        <title>My Inbox - CampusBookEx</title>
        <meta
          name="description"
          content="View and manage all your book exchange conversations and messages."
        />
      </Helmet>

      <Link
        to="/"
        className="inline-flex items-center mb-4 font-medium transition-colors duration-300 text-primary hover:text-accent group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
        Back to all books
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-primary">My Inbox</h1>
      </div>

      {renderContent()}
    </div>
  );
};

export default InboxPage;
