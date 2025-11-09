// src/components/common/ListBookModal.tsx
import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// --- 1. IMPORT UPLOAD SERVICE ---
import { createBook } from '../../services/bookService';
import { uploadImage } from '../../services/uploadService'; // <-- NEW

import type { CreateBookData, Book } from '../../types';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { useUIStore } from '../../store/uiStore';
import { UploadCloud, Image as ImageIcon } from 'lucide-react'; // <-- NEW ICONS

// --- 2. NEW FORM TYPE ---
// This is the data from our form, which includes the 'image' FileList
type ListBookFormData = {
  title: string;
  author: string;
  condition: 'New' | 'Good' | 'Used';
  isbn?: string;
  image: FileList;
};

const ListBookModal = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isListBookModalOpen = useUIStore((state) => state.isListBookModalOpen);
  const closeListBookModal = useUIStore((state) => state.closeListBookModal);

  // --- 3. LOCAL STATE FOR IMAGE PREVIEW ---
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch, // We'll watch the image field
    formState: { errors },
  } = useForm<ListBookFormData>(); // <-- 4. USE NEW FORM TYPE

  // Watch the 'image' field to update the preview
  const imageFile = watch('image');
  React.useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  // --- 5. UPDATE MUTATION TO CHAIN API CALLS ---
  const { mutate, isPending } = useMutation<Book, Error, ListBookFormData>({
    mutationFn: async (data: ListBookFormData) => {
      let imageUrl = ''; // Default empty string

      // --- 5a. UPLOAD IMAGE (if one exists) ---
      if (data.image && data.image.length > 0) {
        toast.loading('Uploading image...');
        const file = data.image[0];
        const formData = new FormData();
        formData.append('image', file);

        imageUrl = await uploadImage(formData);
        toast.dismiss(); // Dismiss the "uploading" toast
      }

      // --- 5b. PREPARE BOOK DATA ---
      const bookData: CreateBookData = {
        title: data.title,
        author: data.author,
        condition: data.condition,
        isbn: data.isbn,
        imageUrl: imageUrl, // Use the new URL (or empty string)
      };

      // --- 5c. CREATE THE BOOK ---
      return createBook(bookData);
    },
    onSuccess: (data) => {
      toast.success('Your book has been listed!');
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });

      handleClose(); // Close modal and clear form

      navigate(`/book/${data._id}`);
    },
    onError: (error: any) => {
      toast.dismiss(); // Dismiss loading toast if it was there
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    },
  });

  const onSubmit: SubmitHandler<ListBookFormData> = (data) => {
    mutate(data);
  };

  const handleClose = () => {
    reset();
    setImagePreview(null);
    closeListBookModal();
  };

  return (
    <Modal
      isOpen={isListBookModalOpen}
      onClose={handleClose}
      title="List Your Book"
    >
      {/* --- 6. UPDATE FORM --- */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title, Author, Condition (unchanged) ... */}
        <div>
          <label
            htmlFor="title-modal"
            className="block text-sm font-medium text-dark-text"
          >
            Book Title
          </label>
          <input
            id="title-modal"
            type="text"
            {...register('title', { required: 'Title is required' })}
            className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="author-modal"
            className="block text-sm font-medium text-dark-text"
          >
            Author
          </label>
          <input
            id="author-modal"
            type="text"
            {...register('author', { required: 'Author is required' })}
            className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm ${
              errors.author ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {errors.author && (
            <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="condition-modal"
            className="block text-sm font-medium text-dark-text"
          >
            Condition
          </label>
          <select
            id="condition-modal"
            {...register('condition', { required: 'Condition is required' })}
            className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm ${
              errors.condition ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            <option value="">Select a condition...</option>
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Used">Used</option>
          </select>
          {errors.condition && (
            <p className="mt-1 text-sm text-red-600">
              {errors.condition.message}
            </p>
          )}
        </div>

        {/* --- 7. NEW IMAGE UPLOAD FIELD --- */}
        <div>
          <label className="block text-sm font-medium text-dark-text">
            Book Cover (Optional)
          </label>
          <div className="flex items-center mt-1 space-x-4">
            {/* Image Preview */}
            <div className="flex items-center justify-center w-24 h-24 overflow-hidden bg-gray-100 rounded-md">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              ) : (
                <ImageIcon className="w-10 h-10 text-gray-400" />
              )}
            </div>
            {/* File Input */}
            <label
              htmlFor="image-file"
              className="flex flex-col items-center justify-center flex-1 px-6 py-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer  hover:border-primary"
            >
              <UploadCloud className="w-8 h-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-600">
                Click to upload a file
              </span>
              <input
                id="image-file"
                type="file"
                {...register('image')}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden" // The label handles the click
              />
            </label>
          </div>
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
          )}
        </div>

        {/* ISBN Field (unchanged) */}
        <div>
          <label
            htmlFor="isbn-modal"
            className="block text-sm font-medium text-dark-text"
          >
            ISBN (Optional)
          </label>
          <input
            id="isbn-modal"
            type="text"
            {...register('isbn')}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Submit Button (unchanged) */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-2 font-semibold text-white transition-all duration-300 rounded-lg shadow-md  bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? 'Listing Book...' : 'List My Book'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ListBookModal;
