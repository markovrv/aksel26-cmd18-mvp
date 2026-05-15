// === App Router ===
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Toast } from './components/Toast';
import { useAuthStore } from './store/useAuthStore';

// Pages
import { HomePage } from './pages/HomePage';
import { ProfessionsPage } from './pages/ProfessionsPage';
import { ProfessionDetailPage } from './pages/ProfessionDetailPage';
import { EnterprisesPage } from './pages/EnterprisesPage';
import { EnterpriseDetailPage } from './pages/EnterpriseDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { BookingsPage } from './pages/BookingsPage';
import { QRScannerPage } from './pages/QRScannerPage';
import { HelpPage } from './pages/HelpPage';
import { MapPage } from './pages/MapPage';
import { EnterprisePanelPage } from './pages/EnterprisePanelPage';
import { AdminPage } from './pages/AdminPage';

function ProtectedRoute({ children, roles }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="spinner" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <Toast />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public routes with layout (browsing without auth) */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/professions" element={<Layout><ProfessionsPage /></Layout>} />
        <Route path="/professions/:id" element={<Layout><ProfessionDetailPage /></Layout>} />
        <Route path="/enterprises" element={<Layout><EnterprisesPage /></Layout>} />
        <Route path="/enterprises/:id" element={<Layout><EnterpriseDetailPage /></Layout>} />
        <Route path="/map" element={<Layout><MapPage /></Layout>} />

        {/* Protected routes — require auth */}
        <Route path="/bookings" element={<ProtectedRoute><Layout><BookingsPage /></Layout></ProtectedRoute>} />
        <Route path="/qr" element={<ProtectedRoute><Layout><QRScannerPage /></Layout></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Layout><HelpPage /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />

        {/* Enterprise panel */}
        <Route
          path="/enterprise-panel"
          element={
            <ProtectedRoute roles={['enterprise', 'admin']}>
              <Layout><EnterprisePanelPage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <Layout><AdminPage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}