import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import NotificationHost from './components/ui/NotificationHost';
import { notify } from './lib/notifications';

if (typeof window !== 'undefined') {
  window.alert = (message) => {
    notify({
      type: 'info',
      title: 'Notice',
      message: typeof message === 'string' ? message : 'Action completed.',
      duration: 5200,
    });
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <NotificationHost />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

