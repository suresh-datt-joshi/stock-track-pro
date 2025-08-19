// src/AppContent.jsx
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Welcome from './components/auth/Welcome';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ResetPassword from './components/auth/ResetPassword';
import StockMarketDashboard from './components/dashboard/StockMarketDashboard';

const AppContent = () => {
  const { currentUser, loadingAuth } = useAuth();
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [authView, setAuthView] = useState('login');

  // ADD state for login attempts here
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Function to handle switching views and resetting the counter
  const handleSwitchView = (view) => {
    setLoginAttempts(0); // Reset attempts when switching away from login
    setAuthView(view);
  }

  if (showWelcome) {
    return <Welcome onLetsGo={() => setShowWelcome(false)} />;
  }

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (currentUser) {
    return <StockMarketDashboard />;
  }
  
  switch (authView) {
    case 'signup':
      return <Signup switchToLogin={() => handleSwitchView('login')} />;
    case 'resetPassword':
      return <ResetPassword switchToLogin={() => handleSwitchView('login')} />;
    case 'login':
    default:
      return (
        <Login 
          // Pass the state and handlers down as props
          switchToSignup={() => handleSwitchView('signup')}
          goToForgotPassword={() => setAuthView('resetPassword')}
          loginAttempts={loginAttempts}
          setLoginAttempts={setLoginAttempts}
        />
      );
  }
};

export default AppContent;