// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';

// This is a more comprehensive hook that manages the login state
// as well as the token itself.

export const useAuth = () => {
  // Check the initial state from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  
  // A simple effect to listen for storage changes, e.g., in other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // You might want to navigate to '/' or '/login' here
    // window.location.href = '/login'; 
  };
  
  const getToken = (): string | null => {
    return localStorage.getItem('token');
  };

  return { isLoggedIn, login, logout, getToken };
};