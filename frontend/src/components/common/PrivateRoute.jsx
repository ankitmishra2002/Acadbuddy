import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import useAuthStore from '../../store/authStore';

const PrivateRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, userLoading } = useAuthStore();

  // Wait for Clerk to load
  if (!isLoaded) return null;

  // Not signed in with Clerk → go to login
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Clerk is signed in but we're still fetching the MongoDB user
  if (userLoading) return null;

  // Signed in with Clerk but no MongoDB user → needs onboarding
  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default PrivateRoute;
