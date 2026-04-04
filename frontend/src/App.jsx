import React, { useState, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Preloader from './components/Preloader';
import { ThemeContext } from './context/ThemeContext';

const App = () => {
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);

  return (
    <div className={theme}>
      {loading ? (
        <Preloader onComplete={() => setLoading(false)} />
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      )}
    </div>
  );
};

export default App;
