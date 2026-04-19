import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TaskLaunchPage } from '../pages/TaskLaunchPage';
import { TaskProcessPage } from '../pages/TaskProcessPage';
import { ReportPreviewPage } from '../pages/ReportPreviewPage';
import { HistoryFavoritesPage } from '../pages/HistoryFavoritesPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { PlatformInitPage } from '../pages/PlatformInitPage';
import { ProfilePage } from '../pages/ProfilePage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { AlertsMessagesPage } from '../pages/AlertsMessagesPage';
import { WelcomePage } from '../pages/WelcomePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/platform-init" element={<PlatformInitPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/alerts" element={<AlertsMessagesPage />} />
      <Route path="/" element={<TaskLaunchPage />} />
      <Route path="/process" element={<TaskProcessPage />} />
      <Route path="/report" element={<ReportPreviewPage />} />
      <Route path="/history" element={<HistoryFavoritesPage />} />
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}
