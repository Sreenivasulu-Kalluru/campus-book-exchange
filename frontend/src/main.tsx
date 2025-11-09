// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async'; // <-- 1. IMPORT
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      {/* <-- 2. WRAP YOUR APP */}
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="bottom-right"
          reverseOrder={false} // Show new toasts on top
          toastOptions={{
            // Default options
            duration: 4000,
            style: {
              background: '#F8F9FA', // Our light-bg color
              color: '#212529', // Our dark-text color
              border: '1px solid #E5E7EB', // A subtle border
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              padding: '16px',
            },

            // Specific styles for success/error
            success: {
              style: {
                background: '#E6F7ED', // A light green
                color: '#0D47A1', // Our primary blue
              },
              iconTheme: {
                primary: '#0D47A1', // Our primary blue
                secondary: '#E6F7ED',
              },
            },
            error: {
              style: {
                background: '#FFF1F2', // A light red
                color: '#DC2626', // A strong red
              },
              iconTheme: {
                primary: '#DC2626',
                secondary: '#FFF1F2',
              },
            },
          }}
        />
        <App />
      </QueryClientProvider>
    </HelmetProvider>{' '}
    {/* <-- 3. END WRAP */}
  </React.StrictMode>
);
