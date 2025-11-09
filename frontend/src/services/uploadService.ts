// src/services/uploadService.ts
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

type UploadResponse = {
  message: string;
  imageUrl: string;
};

export const uploadImage = async (formData: FormData): Promise<string> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authorized');

  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Important for file uploads
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.imageUrl; // Return only the URL
};
