// src/pages/HomePage.tsx
import React, { useState } from 'react'; // <-- 1. IMPORT useState
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { getAllBooks } from '../services/bookService';
import type { BookQuery } from '../services/bookService'; // <-- 2. IMPORT our new type
import BookCard from '../components/common/BookCard';
import BookCardSkeleton from '../components/common/BookCardSkeleton';
import { Search, X } from 'lucide-react'; // <-- 3. IMPORT icons

const HomePage = () => {
  // --- 4. ADD STATE for our filters ---
  const [query, setQuery] = useState<BookQuery>({
    search: '',
    condition: '',
    department: '', // We'll add this later if we want
  });

  // --- 5. UPDATE useQuery ---
  const {
    data: books,
    isLoading,
    isError,
    error,
  } = useQuery({
    // THIS IS THE MAGIC:
    // React Query will automatically re-run this query
    // whenever any value in the queryKey array changes.
    queryKey: ['books', query], // <-- Pass the query state as a dependency
    queryFn: () => getAllBooks(query), // <-- Pass the query state to the fetcher
  });

  // --- 6. ADD HANDLERS for inputs ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleConditionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuery((prev) => ({ ...prev, condition: e.target.value }));
  };

  const clearFilters = () => {
    setQuery({ search: '', condition: '', department: '' });
  };

  // --- Success State ---
  return (
    <div className="w-full">
      <Helmet>
        <title>CampusBookEx - Home</title>
        <meta
          name="description"
          content="Exchange textbooks and notes with students on your campus. Browse available books for your courses."
        />
      </Helmet>

      <h1 className="mb-6 text-3xl font-bold text-dark-text">
        Available Books
      </h1>

      {/* --- 7. ADD THE NEW FILTER/SEARCH UI --- */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <label
              htmlFor="search"
              className="block mb-1 text-sm font-medium text-dark-text"
            >
              Search by Title or Author
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                value={query.search}
                onChange={handleSearchChange}
                placeholder="e.g., 'Data Structures' or 'JavaScript'"
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            </div>
          </div>

          {/* Condition Dropdown */}
          <div>
            <label
              htmlFor="condition"
              className="block mb-1 text-sm font-medium text-dark-text"
            >
              Filter by
            </label>
            <select
              id="condition"
              value={query.condition}
              onChange={handleConditionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Books</option>
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Used">Used</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- 8. RENDER THE RESULTS --- */}
      {isLoading ? (
        // --- Loading State ---
        <div className="grid items-start grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        // --- Error State ---
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-semibold">Error loading books.</h2>
          <p>{(error as Error).message}</p>
        </div>
      ) : (
        // --- Data State ---
        <>
          {books?.length === 0 && (
            <div className="p-6 text-center bg-white rounded-lg shadow-sm">
              <X className="w-12 h-12 mx-auto text-gray-400" />
              <p className="mt-2 font-semibold text-gray-600">
                No books found.
              </p>
              <p className="text-gray-500">
                Try adjusting your search or filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 mt-4 text-white rounded-md bg-primary hover:bg-blue-800"
              >
                Clear Filters
              </button>
            </div>
          )}

          <div className="grid items-start grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books?.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
