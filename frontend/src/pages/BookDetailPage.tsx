// src/pages/BookDetailPage.tsx
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getBookById } from '../services/bookService';
import { createRequest, checkRequestStatus } from '../services/requestService';
import type { ApiError } from '../services/requestService';
import type { Book } from '../types';
import { useAuthStore } from '../store/authStore';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import {
  BookMarked,
  UserCircle,
  CalendarDays,
  CheckCircle,
  ArrowLeft,
  Send,
  Loader2,
} from 'lucide-react'; // Removed FileText and Download

/**
 * Skeleton loader component for the detail page.
 */
const DetailSkeleton = () => (
  <div className="flex flex-col w-full gap-8 md:flex-row animate-pulse">
    <div className="w-full bg-gray-300 rounded-lg md:w-1/3 h-80"></div>
    <div className="w-full md:w-2/3">
      <div className="w-3/4 h-10 mb-4 bg-gray-300 rounded"></div>
      <div className="w-1/2 h-6 mb-8 bg-gray-300 rounded"></div>
      <div className="w-1/4 h-4 mb-4 bg-gray-300 rounded"></div>
      <div className="w-1/3 h-4 mb-4 bg-gray-300 rounded"></div>
      <div className="w-1/4 h-4 mb-8 bg-gray-300 rounded"></div>
      <div className="w-1/2 h-12 bg-gray-300 rounded"></div>
    </div>
  </div>
);

/**
 * The main component for displaying the details of a single book.
 */
const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAuth = useAuthStore((state) => state.isAuth);
  const user = useAuthStore((state) => state.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  // --- DELETED pdfPreviewFailed state ---

  const {
    data: book,
    isLoading,
    isError,
    error,
  } = useQuery<Book>({
    queryKey: ['book', id],
    queryFn: () => getBookById(id!),
    enabled: !!id,
  });

  // --- UPDATED 'permission' query to 'requestState' ---
  const { data: requestState } = useQuery({
    queryKey: ['requestStatus', id],
    queryFn: () => checkRequestStatus(id!),
    enabled: isAuth && !!id,
  });

  // --- UPDATED logic to get status ---
  const requestStatus = requestState?.status || null;

  // --- Data Mutation (Send Request) ---
  const { mutate: sendRequest, isPending: isRequesting } = useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      toast.success('Your request has been sent!');
      setIsModalOpen(false);
      setMessage('');
      // Manually refetch the status after sending a request
      queryClient.invalidateQueries({ queryKey: ['requestStatus', id] });
    },
    onError: (err: ApiError | Error) => {
      let message =
        'Failed to send request. You may have already requested this book.';
      if ('response' in err) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      toast.error(message);
    },
  });

  // --- DELETED 'download' mutation ---

  // --- Event Handlers ---
  const handleRequestClick = () => {
    if (!isAuth) {
      toast.error('Please log in to request this book.');
      navigate('/login');
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    sendRequest({ bookId: id, message });
  };

  // --- Derived State ---
  const isLister = user?._id === book?.lister?._id;
  const isProcessing = isRequesting; // Simplified

  // --- Helper to render the main button ---
  const renderCallToAction = () => {
    if (isLister) {
      return (
        <button
          disabled
          className="w-full px-6 py-3 text-lg font-bold text-gray-500 bg-gray-300 rounded-lg cursor-not-allowed md:w-1/2"
        >
          This is your listing
        </button>
      );
    }

    // --- NEW LOGIC based on requestStatus ---
    if (requestStatus === 'Pending') {
      return (
        <button
          disabled
          className="w-full px-6 py-3 text-lg font-bold text-white bg-yellow-500 rounded-lg shadow-md opacity-75 cursor-not-allowed md:w-1/2"
        >
          Request Sent (Pending)
        </button>
      );
    }

    if (requestStatus === 'Accepted') {
      return (
        <button
          disabled
          className="w-full px-6 py-3 text-lg font-bold text-white bg-green-600 rounded-lg shadow-md opacity-75 cursor-not-allowed md:w-1/2"
        >
          Request Accepted
        </button>
      );
    }

    // Default: 'null' or 'Declined'
    return (
      <button
        onClick={handleRequestClick}
        disabled={isProcessing}
        className="w-full px-6 py-3 text-lg font-bold transition-all duration-300 rounded-lg shadow-md md:w-1/2 bg-accent text-primary hover:bg-yellow-400 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-dark disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100"
      >
        {requestStatus === 'Declined' ? 'Request Again' : 'Request This Book'}
      </button>
    );
  };

  const description = book
    ? `Find "${book.title}" by ${book.author} on CampusBookEx. Condition: ${book.condition}. Listed by ${book.lister?.name}.`
    : 'Load book details from CampusBookEx.';

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="w-full">
        <Helmet>
          <title>Loading Book... - CampusBookEx</title>
        </Helmet>
        <div className="inline-flex items-center mb-4 font-medium text-primary">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to all books
        </div>
        <DetailSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full text-center text-red-500">
        <Helmet>
          <title>Error - CampusBookEx</title>
        </Helmet>
        <h2 className="text-2xl font-semibold">Error loading book.</h2>
        <p>{(error as Error).message || 'Book not found'}</p>
        <Link to="/" className="inline-block mt-4 text-primary hover:underline">
          Go back to Home
        </Link>
      </div>
    );
  }

  // --- Success State ---
  return (
    <div className="w-full">
      <Helmet defaultTitle="Book Details - CampusBookEx">
        <title>
          {book
            ? `${book.title} - CampusBookEx`
            : 'Book Details - CampusBookEx'}
        </title>
        <meta name="description" content={description} />
      </Helmet>

      <Link
        to="/"
        className="inline-flex items-center mb-4 font-medium transition-colors duration-300 text-primary hover:text-accent group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
        Back to all books
      </Link>

      <div className="p-6 bg-white rounded-lg shadow-lg md:p-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* --- CLEANED UP IMAGE SECTION --- */}
          <div className="flex items-center justify-center w-full overflow-hidden bg-gray-100 rounded-lg md:w-1t/3 h-80">
            {book?.imageUrl ? (
              <img
                src={book.imageUrl}
                alt={book.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <BookMarked className="w-24 h-24 text-gray-400" />
            )}
          </div>

          {/* Details Section */}
          <div className="w-full md:w-2/3">
            <h1 className="mb-2 text-3xl font-bold md:text-4xl text-primary">
              {book?.title}
            </h1>
            <p className="mb-6 text-xl text-dark-text">by {book?.author}</p>
            <div className="mb-8 space-y-3">
              <div className="flex items-center text-lg">
                <UserCircle className="w-5 h-5 mr-3 text-accent" />
                <span>
                  Listed by: <strong>{book?.lister?.name || 'Unknown'}</strong>{' '}
                  ({book?.lister?.department || 'N/A'})
                </span>
              </div>
              <div className="flex items-center text-lg">
                <CheckCircle className="w-5 h-5 mr-3 text-accent" />
                <span>
                  Condition: <strong>{book?.condition}</strong>
                </span>
              </div>
              <div className="flex items-center text-lg">
                <CalendarDays className="w-5 h-5 mr-3 text-accent" />
                <span>
                  Listed on:{' '}
                  <strong>
                    {new Date(book!.createdAt).toLocaleDateString()}
                  </strong>
                </span>
              </div>
            </div>

            {renderCallToAction()}

            {/* --- DELETED 'canDownload' PARAGRAPH --- */}
          </div>
        </div>
      </div>

      {/* --- Request Modal --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Send Request"
      >
        <form onSubmit={handleSubmitRequest}>
          <p className="mb-4">
            You are sending a request for <strong>{book?.title}</strong> to{' '}
            <strong>{book?.lister?.name}</strong>.
          </p>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-dark-text"
          >
            Add an optional message (200 chars max):
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
            rows={3}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Hi, I'm in the MCA 3rd sem and I'd love to..."
          />
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 transition-colors bg-gray-200 rounded-lg text-dark-text hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRequesting}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-blue-800 disabled:bg-gray-400"
            >
              {isRequesting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              {isRequesting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookDetailPage;
