// src/types/index.ts

export type Lister = {
  _id: string;
  name: string;
  department: string;
};

export type Book = {
  _id: string;
  title: string;
  author: string;
  condition: 'New' | 'Good' | 'Used';
  lister: Lister;
  status: 'Available' | 'Sold';
  isbn?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  department: string;
};

export type AuthResponse = {
  _id: string;
  name: string;
  email: string;
  department: string;
  token: string;
};

export type BookRequest = {
  _id: string;
  requester: string;
  book: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  message?: string;
  createdAt: string;
};

export type PopulatedRequest = {
  _id: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  message?: string;
  createdAt: string;
  book: {
    // This can be null if the book was deleted
    _id: string;
    title: string;
  } | null;
  requester: {
    _id: string;
    name: string;
    department: string;
  };
};

export type CreateBookData = {
  title: string;
  author: string;
  condition: 'New' | 'Good' | 'Used';
  isbn?: string;
  imageUrl?: string;
};

export type ApiError = {
  response: {
    data: {
      message: string;
      stack?: string;
    };
  };
};

export type Conversation = {
  _id: string;
  participants: User[]; // This will be populated with user objects
  book: {
    _id: string;
    title: string;
    imageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  _id: string;
  conversationId: string;
  sender: string; // This will be a User ID
  content: string;
  createdAt: string;
};
