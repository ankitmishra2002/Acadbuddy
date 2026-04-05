import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import PrivateRoute from './components/common/PrivateRoute.jsx';
import AdminRoute from './components/common/AdminRoute.jsx';

const Layout = lazy(() => import('./components/layout/Layout'));
const Landing = lazy(() => import('./Pages/Landing.jsx'));
const Login = lazy(() => import('./Pages/Login.jsx'));
const Dashboard = lazy(() => import('./Pages/Dashboard.jsx'));
const Subjects = lazy(() => import('./Pages/Subjects.jsx'));
const SubjectWorkspace = lazy(() => import('./Pages/SubjectWorkspace.jsx'));
const Styles = lazy(() => import('./Pages/Styles.jsx'));
const Community = lazy(() => import('./Pages/Community.jsx'));
const PostDetail = lazy(() => import('./Pages/PostDetail.jsx'));
const FocusMode = lazy(() => import('./Pages/FocusMode.jsx'));
const ContentView = lazy(() => import('./Pages/ContentView.jsx'));
const Profile = lazy(() => import('./Pages/Profile.jsx'));
const AdminDashboard = lazy(() => import('./Pages/AdminDashboard.jsx'));
const SmartStudies = lazy(() => import('./Pages/SmartStudies.jsx'));
const QuickRevision = lazy(() => import('./Pages/QuickRevision.jsx'));

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div
        className="h-10 w-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"
        aria-hidden
      />
    </div>
  );
}

function App() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const authFetchStarted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      authFetchStarted.current = false;
      return;
    }
    if (user != null) return;
    if (authFetchStarted.current) return;
    authFetchStarted.current = true;
    fetchUser();
  }, [isAuthenticated, user, fetchUser]);

  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
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
            path="/smart-studies"
            element={
              <PrivateRoute>
                <Layout>
                  <SmartStudies />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/quick-rvsn"
            element={
              <PrivateRoute>
                <Layout>
                  <QuickRevision />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="/smart studies" element={<Navigate to="/smart-studies" replace />} />
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
      </Suspense>
    </Router>
  );
}

export default App;
