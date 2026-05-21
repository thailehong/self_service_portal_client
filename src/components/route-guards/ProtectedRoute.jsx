import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppLoader } from '../common/AppLoader';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitializing } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isInitializing) {
    return <AppLoader message="Restoring authenticated session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
