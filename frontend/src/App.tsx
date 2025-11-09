// src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/common/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookDetailPage from './pages/BookDetailPage';
import ProfilePage from './pages/ProfilePage';
import SocketHandler from './context/SocketHandler'; // Don't forget this
import InboxPage from './pages/InboxPage'; // <-- 1. IMPORT
import ConversationPage from './pages/ConversationPage'; // <-- 2. IMPORT

// --- THIS IS THE CORRECTED ROUTER ---
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // This is the main layout for ALL pages
    children: [
      // --- Public Routes ---
      {
        index: true, // This is the default route (HomePage)
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'book/:id',
        element: <BookDetailPage />,
      },

      // --- Private Routes ---
      // This one pathless element wraps all its children.
      // If the user is not auth'd, <PrivateRoute> will redirect.
      // If they are auth'd, it will render the <Outlet>
      // which React Router fills with the child (e.g., ProfilePage).
      {
        element: <PrivateRoute />,
        children: [
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            // <-- 3. ADD INBOX ROUTE
            path: 'inbox',
            element: <InboxPage />,
          },
          {
            // <-- 4. ADD CONVERSATION ROUTE
            path: 'chat/:id',
            element: <ConversationPage />,
          },
          // (We would add other private routes here)
        ],
      },
    ],
  },
]);

// This is your App component (make sure SocketHandler is here)
function App() {
  return (
    <>
      <SocketHandler />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
