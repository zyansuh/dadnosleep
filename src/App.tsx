import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminGateProvider } from './context/AdminGateContext';
import { DiscordAuthProvider } from './context/DiscordAuthContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMembersPage } from './pages/admin/AdminMembersPage';
import { AdminPointsPage } from './pages/admin/AdminPointsPage';
import { AdminSuggestionsPage } from './pages/admin/AdminSuggestionsPage';
import { SuggestionsListPage } from './pages/suggestions/SuggestionsListPage';
import { SuggestionDetailPage } from './pages/suggestions/SuggestionDetailPage';

import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <DiscordAuthProvider>
        <AdminGateProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/suggestions" element={<SuggestionsListPage />} />
            <Route path="/suggestions/:id" element={<SuggestionDetailPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/admin" element={<PrivateRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="members" element={<AdminMembersPage />} />
                <Route path="points" element={<AdminPointsPage />} />
                <Route path="suggestions" element={<AdminSuggestionsPage />} />
              </Route>
            </Route>
          </Routes>
        </AdminGateProvider>
      </DiscordAuthProvider>
    </BrowserRouter>
  );
}
