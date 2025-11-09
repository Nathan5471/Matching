import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AuthenticatedRoute() {
  const { user } = useAuth();

  if (user === undefined) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
}
