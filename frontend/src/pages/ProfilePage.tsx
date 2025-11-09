// src/pages/ProfilePage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyListings, getMyHistory } from '../services/bookService';
import { Helmet } from 'react-helmet-async';
import {
  getReceivedRequests,
  respondToRequest,
  getSentRequests,
} from '../services/requestService';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { Link } from 'react-router-dom';
import BookCard from '../components/common/BookCard';
import BookCardSkeleton from '../components/common/BookCardSkeleton';
import {
  Loader2,
  Inbox,
  Book as BookIcon,
  PlusCircle,
  ArrowLeft,
  Archive,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { PopulatedRequest } from '../types'; // <-- This import is now correctly used

/**
 * Sub-component: Renders the user's available listings.
 */
const MyListings = () => {
  const {
    data: books,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['myListings'],
    queryFn: getMyListings,
  });

  if (isLoading) {
    return (
      <div className="grid items-start grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (isError || !books) {
    return <p className="text-red-500">Error loading your listings.</p>;
  }
  if (books.length === 0) {
    return (
      <div className="p-6 text-center rounded-lg bg-gray-50">
        <BookIcon className="w-12 h-12 mx-auto text-gray-400" />
        <p className="mt-2 text-gray-600">
          You haven't listed any available books.
        </p>
      </div>
    );
  }
  return (
    <div className="grid items-start grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        // --- THIS IS THE FIX ---
        // We just render the BookCard directly.
        // The wrapper div and the button are gone.
        <BookCard key={book._id} book={book} />
        // ---------------------
      ))}
    </div>
  );
};

/**
 * Sub-component: Renders received requests and handles actions.
 */
const ReceivedRequests = () => {
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const {
    data: requests,
    isLoading,
    isError,
  } = useQuery<PopulatedRequest[]>({
    queryKey: ['receivedRequests'],
    queryFn: getReceivedRequests,
  });

  const { mutate: respond, isPending } = useMutation({
    mutationFn: respondToRequest,
    onSuccess: (data) => {
      toast.success(`Request ${data.status.toLowerCase()}!`);
      queryClient.invalidateQueries({ queryKey: ['receivedRequests'] });

      if (data.status === 'Accepted') {
        queryClient.invalidateQueries({ queryKey: ['myListings'] });
        queryClient.invalidateQueries({ queryKey: ['myHistory'] });
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to respond. Please try again.');
    },
    onSettled: () => {
      setPendingId(null);
    },
  });

  const handleResponse = (
    requestId: string,
    status: 'Accepted' | 'Declined'
  ) => {
    setPendingId(requestId);
    respond({ requestId, status });
  };

  if (isLoading) {
    return <Loader2 className="w-8 h-8 animate-spin text-primary" />;
  }
  if (isError || !requests) {
    return <p className="text-red-500">Error loading your requests.</p>;
  }
  if (requests.length === 0) {
    return (
      <div className="p-6 text-center rounded-lg bg-gray-50">
        <Inbox className="w-12 h-12 mx-auto text-gray-400" />
        <p className="mt-2 text-gray-600">You have no new requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const isThisButtonLoading = isPending && pendingId === req._id;
        return (
          <div
            key={req._id}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="flex flex-col items-start justify-between sm:flex-row">
              <div className="flex-1 mb-3 sm:mb-0">
                <p className="text-lg font-medium text-dark-text">
                  <span className="font-bold text-primary">
                    {req.requester.name}
                  </span>{' '}
                  requested
                  <span className="font-bold text-primary">
                    {' '}
                    {req.book?.title}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  From: {req.requester.department} | Status:{' '}
                  <span className="font-semibold">{req.status}</span>
                </p>
                {req.message && (
                  <p className="inline-block p-2 mt-2 text-gray-700 bg-gray-100 rounded">
                    "{req.message}"
                  </p>
                )}
              </div>

              {req.status === 'Pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponse(req._id, 'Accepted')}
                    disabled={isThisButtonLoading}
                    className="flex items-center justify-center w-24 px-3 py-1 text-sm text-white bg-green-500 rounded-md hover:bg-green-600 disabled:bg-gray-400"
                  >
                    {isThisButtonLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Accept'
                    )}
                  </button>
                  <button
                    onClick={() => handleResponse(req._id, 'Declined')}
                    disabled={isThisButtonLoading}
                    className="flex items-center justify-center w-24 px-3 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-gray-400"
                  >
                    {isThisButtonLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Decline'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Sub-component: Renders the user's exchange history (sold books).
 */
const MyHistory = () => {
  const {
    data: books,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['myHistory'],
    queryFn: getMyHistory,
  });

  if (isLoading) {
    return <Loader2 className="w-8 h-8 animate-spin text-primary" />;
  }
  if (isError || !books) {
    return <p className="text-red-500">Error loading your history.</p>;
  }
  if (books.length === 0) {
    return (
      <div className="p-6 text-center rounded-lg bg-gray-50">
        <Archive className="w-12 h-12 mx-auto text-gray-400" />
        <p className="mt-2 text-gray-600">You have no exchange history yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {books.map((book) => (
        <div
          key={book._id}
          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm opacity-70"
        >
          <p className="text-lg font-medium text-dark-text">{book.title}</p>
          <p className="text-sm text-gray-500">by {book.author}</p>
          <p className="text-sm text-gray-500">
            Exchanged on: {new Date(book.updatedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

/**
 * Sub-component: Renders the user's sent requests.
 */
const MySentRequests = () => {
  const {
    data: requests,
    isLoading,
    isError,
  } = useQuery<PopulatedRequest[]>({
    queryKey: ['sentRequests'],
    queryFn: getSentRequests,
  });

  if (isLoading) {
    return <Loader2 className="w-8 h-8 animate-spin text-primary" />;
  }
  if (isError || !requests) {
    return <p className="text-red-500">Error loading your sent requests.</p>;
  }
  if (requests.length === 0) {
    return (
      <div className="p-6 text-center rounded-lg bg-gray-50">
        <Send className="w-12 h-12 mx-auto text-gray-400" />
        <p className="mt-2 text-gray-600">You haven't sent any requests yet.</p>
      </div>
    );
  }

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    if (status === 'Accepted') return 'text-green-600';
    if (status === 'Declined') return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="space-y-3">
      {requests
        .filter((req) => req.book) // Filter out requests for deleted books
        .map((req) => (
          <div
            key={req._id}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <p className="text-lg font-medium text-dark-text">
              Request for{' '}
              <span className="font-bold text-primary">{req.book?.title}</span>
            </p>
            <p className={`font-semibold ${getStatusColor(req.status)}`}>
              Status: {req.status}
            </p>
          </div>
        ))}
    </div>
  );
};

/**
 * Main component: The Profile Page
 */
const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const openListBookModal = useUIStore((state) => state.openListBookModal);

  return (
    <div className="w-full space-y-12">
      <Helmet>
        <title>My Profile - CampusBookEx</title>
        <meta
          name="description"
          content="Manage your book listings, see your exchange history, and respond to requests."
        />
      </Helmet>
      {/* Back to Home Link */}
      <Link
        to="/"
        className="inline-flex items-center font-medium transition-colors duration-300 text-primary hover:text-accent group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
        Back to all books
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary">
          Welcome, {user?.name}!
        </h1>
        <p className="text-xl text-gray-600">{user?.email}</p>
      </div>

      {/* Section 1: Received Requests */}
      <section>
        <h2 className="mb-4 text-3xl font-semibold text-dark-text">
          Received Requests
        </h2>
        <ReceivedRequests />
      </section>

      {/* Section 2: My Sent Requests */}
      <section>
        <h2 className="mb-4 text-3xl font-semibold text-dark-text">
          My Sent Requests
        </h2>
        <MySentRequests />
      </section>

      {/* Section 3: My Available Listings */}
      <section>
        <div className="flex flex-col justify-between gap-4 mb-4 sm:flex-row sm:items-center">
          <h2 className="text-3xl font-semibold text-dark-text">
            My Available Listings
          </h2>
          <button
            onClick={openListBookModal}
            className="flex items-center justify-center px-4 py-2 font-medium text-white transition-all duration-300 rounded-lg shadow-sm bg-primary hover:bg-blue-800 hover:shadow-md"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add New Listing
          </button>
        </div>
        <MyListings />
      </section>

      {/* Section 4: My Exchange History */}
      <section>
        <h2 className="mb-4 text-3xl font-semibold text-dark-text">
          My Exchange History
        </h2>
        <MyHistory />
      </section>
    </div>
  );
};

export default ProfilePage;
