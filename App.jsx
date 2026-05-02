import { Toaster } from "@/components/ui/toaster"
import ThemeProvider from '@/components/ThemeProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

import AppLayout from '@/components/layout/AppLayout';
import ProfileSetup from '@/components/ProfileSetup';
import Home from '@/pages/Home';
import SearchPG from '@/pages/SearchPG';
import PGDetail from '@/pages/PGDetail';
import AIAssistant from '@/pages/AIAssistant';
import MyBookings from '@/pages/MyBookings';
import Profile from '@/pages/Profile';
import OwnerDashboard from '@/pages/owner/OwnerDashboard';
import AddEditPG from '@/pages/owner/AddEditPG';
import OwnerBookings from '@/pages/owner/OwnerBookings';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminListings from '@/pages/admin/AdminListings';
import AdminBookings from '@/pages/admin/AdminBookings';

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user && !user.profile_complete) {
    return <ProfileSetup onComplete={() => setRefreshKey(k => k + 1)} />;
  }

  const role = user?.role || 'user';

  return (
    <Routes>
      <Route element={<AppLayout userRole={role} />}>
        {/* User routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPG />} />
        <Route path="/pg/:id" element={<PGDetail />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />

        {/* Owner routes */}
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/owner/add-pg" element={<AddEditPG />} />
        <Route path="/owner/edit-pg" element={<AddEditPG />} />
        <Route path="/owner/bookings" element={<OwnerBookings />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/listings" element={<AdminListings />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return <AppContent />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
