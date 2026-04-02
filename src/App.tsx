import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import EyewearPage from './pages/EyewearPage';
import BookingPage from './pages/BookingPage';
import QRGeneratorPage from './pages/QRGeneratorPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/eyewear" element={<EyewearPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/payment" element={<QRGeneratorPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<ProtectedAdmin><AdminPage /></ProtectedAdmin>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
