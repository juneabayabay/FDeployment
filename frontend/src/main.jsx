import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import AppErrorBoundary from './components/common/AppErrorBoundary';
import './index.css';
import './styles/public-pages.css';
import './styles/patient-auth.css';
import './styles/admin-auth.css';
import './styles/receptionist-auth.css';
import './styles/dentist-auth.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
