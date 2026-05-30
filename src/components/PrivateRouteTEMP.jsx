import { Navigate } from "react-router-dom";
import { canAccess, getStoredUser } from "../utils/auth";

export const ProtectedRoute = ({ children, roles }) => {
  const user = getStoredUser();

  if (!user?.token) return <Navigate to="/" replace />;
  if (!canAccess(roles, user)) return <Navigate to="/dashboard" replace />;

  return children;
};
