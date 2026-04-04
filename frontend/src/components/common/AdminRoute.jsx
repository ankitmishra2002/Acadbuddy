import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import useAuthStore from '../../store/authStore';

const AdminRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useAuthStore();

  if (!isLoaded) return null;

  if (!isSignedIn) return <Navigate to="/login" replace />;
  
  // We STILL rely on your backend user to determine role
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  
  return children;
};

export default AdminRoute;
