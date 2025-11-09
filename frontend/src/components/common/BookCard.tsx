// src/components/common/BookCard.tsx
import { motion } from 'framer-motion';
import { BookMarked, UserCircle } from 'lucide-react'; // Removed 'FileText'
import { Link } from 'react-router-dom';
import type { Book } from '../../types';

// --- DELETED getPdfPreviewUrl function ---

type BookCardProps = {
  book: Book;
};

const BookCard = ({ book }: BookCardProps) => {
  // --- DELETED imageFailed state ---

  // --- Simplified getPreview function ---
  const getPreview = () => {
    if (book.imageUrl) {
      return (
        <img
          src={book.imageUrl}
          alt={book.title}
          className="object-cover w-full h-full"
        />
      );
    }
    // Fallback if no image
    return (
      <div className="flex items-center justify-center w-full h-full">
        <BookMarked className="w-16 h-16 text-gray-400" />
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Link
        to={`/book/${book._id}`}
        className="block overflow-hidden transition-shadow duration-300 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl"
      >
        <div className="w-full h-48 overflow-hidden bg-gray-200">
          {getPreview()}
        </div>

        <div className="p-4">
          <h3
            className="text-xl font-semibold truncate text-primary"
            title={book.title}
          >
            {book.title}
          </h3>
          <p className="mb-3 text-gray-600 truncate" title={book.author}>
            {book.author}
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <UserCircle className="w-4 h-4 mr-2" />
            <span>{book.lister?.name || 'Unknown Lister'}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BookCard;
