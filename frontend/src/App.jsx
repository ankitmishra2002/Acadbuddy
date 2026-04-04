import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectWorkspace from './pages/SubjectWorkspace';
import Styles from './pages/Styles';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import FocusMode from './pages/FocusMode';
import ContentView from './pages/ContentView';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';

function App() {
  const { fetchUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <PrivateRoute>
              <Layout>
                <Subjects />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/subjects/:id"
          element={
            <PrivateRoute>
              <Layout>
                <SubjectWorkspace />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/styles"
          element={
            <PrivateRoute>
              <Layout>
                <Styles />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/community"
          element={
            <Layout>
              <Community />
            </Layout>
          }
        />
        <Route
          path="/community/:id"
          element={
            <Layout>
              <PostDetail />
            </Layout>
          }
        />
        <Route
          path="/content/:contentId"
          element={
            <PrivateRoute>
              <ContentView />
            </PrivateRoute>
          }
        />
        <Route
          path="/focus/:mode/:contentId"
          element={
            <PrivateRoute>
              <FocusMode />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

