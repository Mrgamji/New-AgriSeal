import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import PricingPage from './pages/PricingPage.tsx';
import HowItWorksPage from './pages/HowItWorksPage.tsx';
import BillingsPage from './pages/BillingsPage.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/billings" element={<BillingsPage />} />
            <Route path="/payment/callback" element={<App />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);