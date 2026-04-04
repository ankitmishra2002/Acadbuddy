import React, { useEffect, Fragment } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Dashboard from './Pages/Dashboard';
import Subjects from './Pages/Subjects';
import SubjectWorkspace from './Pages/SubjectWorkspace';
import Community from './Pages/Community';
import PostDetail from './Pages/PostDetail';
import Profile from './Pages/Profile';
import FocusMode from './Pages/FocusMode';
import ContentView from './Pages/ContentView';
import AdminDashboard from './Pages/AdminDashboard';
import AIWorkspace from './Pages/AIWorkspace';
import useAuthStore from './store/authStore';
import FloatingThemeToggle from './components/ui/FloatingThemeToggle';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, userLoading } = useAuthStore();
  const location = useLocation();

  if (userLoading) return null; // Or a loading spinner

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, userLoading } = useAuthStore();
  const location = useLocation();

  if (userLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { fetchUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  return (
    <>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* User Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
      <Route path="/subjects/:id" element={<ProtectedRoute><SubjectWorkspace /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/posts/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/focus" element={<ProtectedRoute><FocusMode /></ProtectedRoute>} />
      <Route path="/ai-workspace" element={<ProtectedRoute><AIWorkspace /></ProtectedRoute>} />
      <Route path="/content/:id" element={<ProtectedRoute><ContentView /></ProtectedRoute>} />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <FloatingThemeToggle />
    </>
  );
}

export default App;
