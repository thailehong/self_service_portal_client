import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectAuth } from '../features/auth/authSlice';
import { AppLoader } from '../components/common/AppLoader';
import { useTranslation } from 'react-i18next';

export function PublicOnlyRoute({ children }) {
  const { t } = useTranslation();
  const auth = useAppSelector(selectAuth);

  if (auth.isInitializing) {
    return <AppLoader message={t('states.restoringSession')} />;
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
