import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import Dashboard from './Pages/Dashboard';
import Subjects from './Pages/Subjects';
import SubjectWorkspace from './Pages/SubjectWorkspace';
import Community from './Pages/Community';
import PostDetail from './Pages/PostDetail';
import Profile from './Pages/Profile';

import AdminDashboard from './Pages/AdminDashboard';
import FocusMode from './Pages/FocusMode';
import Preloader from './components/Preloader';
const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen">
      {loading ? (
        <Preloader onComplete={() => setLoading(false)} />
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:id" element={<SubjectWorkspace />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:id" element={<PostDetail />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/focus" element={<FocusMode />} />
        </Routes>
      )}
    </div>
  );
};

export default App;
