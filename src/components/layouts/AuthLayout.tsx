import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LoadingOverlay } from './LoadingOverlay';
import { Layout } from './Layout';

/**
 * AuthLayout - Protected route wrapper
 *
 * Redirects to /login if user is not authenticated.
 * Shows loading overlay while checking authentication status.
 * Wraps authenticated content with main Layout.
 */
export const AuthLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const location = useLocation();

  // Show loading overlay while checking authentication status
  if (isInitializing) {
    return <LoadingOverlay visible={true} />;
  }

  // Redirect to login if not authenticated, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content within main layout
  return <Layout />;
};
