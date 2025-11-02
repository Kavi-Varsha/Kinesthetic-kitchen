// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // We use the hook we just created

const ProtectedRoute = () => {
  const { isLoggedIn } = useAuth(); // Get the current login status

  // If the user is logged in, allow them to see the nested page (e.g., Dashboard)
  // The <Outlet /> is a placeholder from react-router-dom for the child route.
  if (isLoggedIn) {
    return <Outlet />;
  }

  // If not logged in, redirect them to the /login page
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;