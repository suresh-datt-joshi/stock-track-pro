// src/context/AuthContext.jsx
import React, { useState, useContext, useEffect, createContext } from 'react';
import { API_BASE_URL } from '../api/config';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  // Set loading to true initially to check for stored token
  const [loadingAuth, setLoadingAuth] = useState(true); 
  const [userId, setUserId] = useState(null);

  // This effect runs once on app startup to check for a logged-in user
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');

    if (token && storedUserId) {
      setCurrentUser({ token });
      setUserId(storedUserId);
    }
    // Finished checking, set loading to false
    setLoadingAuth(false);
  }, []);


  const authValue = {
    currentUser,
    userId,
    loadingAuth,
    signup: async (email, password, name, dob, address, phoneNo) => {
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, dob, address, phoneNo }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Signup failed');
      return data;
    },
    login: async (email, password) => {
      setLoadingAuth(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.userId);
        
        setCurrentUser({ token: data.token });
        setUserId(data.userId);
        return data;
      } finally {
        setLoadingAuth(false);
      }
    },
    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      setCurrentUser(null);
      setUserId(null);
    },
    resetPassword: async (customId, identifier, newPassword) => {
        const response = await fetch(`${API_BASE_URL}/users/verify-and-reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customId, identifier, newPassword }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Reset failed');
        return data;
    }
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};
