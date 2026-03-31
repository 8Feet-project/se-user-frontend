import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TaskLaunchPage } from '../pages/TaskLaunchPage';
import { TaskProcessPage } from '../pages/TaskProcessPage';
import { ReportPreviewPage } from '../pages/ReportPreviewPage';
import { HistoryFavoritesPage } from '../pages/HistoryFavoritesPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<TaskLaunchPage />} />
      <Route path="/process" element={<TaskProcessPage />} />
      <Route path="/report" element={<ReportPreviewPage />} />
      <Route path="/history" element={<HistoryFavoritesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
