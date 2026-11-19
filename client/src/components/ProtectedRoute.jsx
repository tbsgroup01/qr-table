import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ allowedRole }) {
  const location = useLocation();
  const userRole = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

  if (!userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole === "admin" && userRole !== "admin") {
    return <Navigate to="/restaurant" replace />;
  }

  if (allowedRole === "restaurant" && userRole !== "restaurant") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute({ children }) {
  const userRole = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

  if (userRole === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (userRole === "restaurant") {
    return <Navigate to="/restaurant" replace />;
  }

  return children;
}
