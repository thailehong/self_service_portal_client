import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppLoader } from '../common/AppLoader';

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isInitializing } = useSelector((state) => state.auth);

  if (isInitializing) {
    return <AppLoader message="Checking session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
