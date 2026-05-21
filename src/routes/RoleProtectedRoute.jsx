import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/useAppSelector";
import { selectAuth } from "../features/auth/authSlice";
import { hasAnyRole } from "../utils/roles";

export function RoleProtectedRoute({ allowedRoleIds, children }) {
  const auth = useAppSelector(selectAuth);
  const location = useLocation();

  if (!hasAnyRole(auth.user, allowedRoleIds)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return children;
}
