import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  
  return children;
};

export default AdminRoute;
