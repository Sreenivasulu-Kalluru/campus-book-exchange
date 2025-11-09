// src/components/common/BookCardSkeleton.tsx

const BookCardSkeleton = () => {
  return (
    <div className="w-full overflow-hidden border border-gray-200 rounded-lg shadow-sm animate-pulse">
      <div className="w-full h-48 bg-gray-300"></div>
      <div className="p-4">
        <div className="w-3/4 h-6 mb-2 bg-gray-300 rounded"></div>
        <div className="w-1/2 h-4 mb-4 bg-gray-300 rounded"></div>
        <div className="w-1/3 h-4 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default BookCardSkeleton;
