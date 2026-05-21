import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectAuth } from '../features/auth/authSlice';
import { AppLoader } from '../components/common/AppLoader';

export function ProtectedRoute({ children }) {
  const { t } = useTranslation();
  const auth = useAppSelector(selectAuth);
  const location = useLocation();

  if (auth.isInitializing) {
    return <AppLoader message={t('states.restoringSession')} />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
