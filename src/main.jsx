import React from 'react';
import ReactDOM from 'react-dom/client';
import { Buffer } from 'buffer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './App';
import { initializeTheme } from './store/themeStore';
import './styles/index.css';

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

initializeTheme();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10, 10, 15, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.12)'
          }
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
