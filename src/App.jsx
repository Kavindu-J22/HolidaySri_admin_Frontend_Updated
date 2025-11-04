import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HSCManagement from './pages/HSCManagement';
import UserManagement from './pages/UserManagement';
import HSCPackages from './pages/HSCPackages';
import PromoCodeManagement from './pages/PromoCodeManagement';
import ClaimingRequests from './pages/ClaimingRequests';
import HSCEarnedClaims from './pages/HSCEarnedClaims';
import DestinationManagement from './pages/DestinationManagement';
import LocationManagement from './pages/LocationManagement';
import MembershipSettings from './pages/MembershipSettings';
import CommercialPartnerSettings from './pages/CommercialPartnerSettings';
import NewsletterSubscribers from './pages/NewsletterSubscribers';
import AdvertisementSlotCharges from './pages/AdvertisementSlotCharges';
import TokenDistribution from './pages/TokenDistribution';
import CustomizeTourPackageManagement from './pages/CustomizeTourPackageManagement';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected admin routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="hsc-management" element={<HSCManagement />} />
                <Route path="token-distribution" element={<TokenDistribution />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="promo-codes" element={<PromoCodeManagement />} />
                <Route path="claiming-requests" element={<ClaimingRequests />} />
                <Route path="hsc-earned-claims" element={<HSCEarnedClaims />} />
                <Route path="destinations" element={<DestinationManagement />} />
                <Route path="locations" element={<LocationManagement />} />
                <Route path="membership-settings" element={<MembershipSettings />} />
                <Route path="commercial-partner-settings" element={<CommercialPartnerSettings />} />
                <Route path="customize-tour-package" element={<CustomizeTourPackageManagement />} />
                <Route path="newsletter-subscribers" element={<NewsletterSubscribers />} />

                {/* Advertisement Management */}
                <Route path="advertisements" element={<AdvertisementSlotCharges />} />
                <Route path="packages" element={<HSCPackages />} />
                <Route path="settings" element={
                  <div className="card p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Settings Coming Soon
                    </h2>
                  </div>
                } />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

export default App;
