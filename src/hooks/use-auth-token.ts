import { useState, useCallback } from 'react';

/**
 * Custom hook to manage the JWT auth token in localStorage.
 */
const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(() => {
    // Initialize state with token from localStorage
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error reading token from localStorage:', error);
      return null;
    }
  });

  const saveToken = useCallback((newToken: string) => {
    try {
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
    }
  }, []);

  const removeToken = useCallback(() => {
    try {
      localStorage.removeItem('authToken');
      setToken(null);
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  }, []);

  return { token, saveToken, removeToken };
};

export default useAuthToken;
