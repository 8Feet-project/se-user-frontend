import { Routes, Route, Navigate } from 'react-router-dom';

import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminLogsPage } from '@/pages/AdminLogsPage';
import { AdminModelsPage } from '@/pages/AdminModelsPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import { AlertsMessagesPage } from '@/pages/AlertsMessagesPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { HistoryFavoritesPage } from '@/pages/HistoryFavoritesPage';
import { LoginPage } from '@/pages/LoginPage';
import { PlatformInitPage } from '@/pages/PlatformInitPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ReportPreviewPage } from '@/pages/ReportPreviewPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { TaskLaunchPage } from '@/pages/TaskLaunchPage';
import { TaskProcessPage } from '@/pages/TaskProcessPage';
import { WelcomePage } from '@/pages/WelcomePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/platform-init" element={<PlatformInitPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/alerts" element={<AlertsMessagesPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="models" element={<AdminModelsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="logs" element={<AdminLogsPage />} />
      </Route>
      <Route path="/launch" element={<TaskLaunchPage />} />
      <Route path="/process" element={<TaskProcessPage />} />
      <Route path="/report" element={<ReportPreviewPage />} />
      <Route path="/history" element={<HistoryFavoritesPage />} />
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}
