// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCredits: (credits: number) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  googleSignIn: () => Promise<void>;
  appleSignIn: () => Promise<void>;
  authMethod: 'email' | 'google' | 'apple' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Local storage helpers
const getAuthToken = (): string => {
  return localStorage.getItem('agriseal_token') || '';
};

const setAuthToken = (token: string) => {
  localStorage.setItem('agriseal_token', token);
};

const removeAuthToken = () => {
  localStorage.removeItem('agriseal_token');
};

const logoutUser = () => {
  removeAuthToken();
  localStorage.removeItem('agriseal_user');
  localStorage.removeItem('agriseal_auth_method');
  
  // Sign out from Firebase too
  auth.signOut();
};

const setAuthMethod = (method: 'email' | 'google' | 'apple') => {
  localStorage.setItem('agriseal_auth_method', method);
};

const getAuthMethod = (): 'email' | 'google' | 'apple' | null => {
  return localStorage.getItem('agriseal_auth_method') as any || null;
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}, skip401Logout = false) => {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Only auto-logout on 401 for authenticated endpoints, not for login/register
      if (response.status === 401 && !skip401Logout) {
        // Check if this is an auth endpoint (login/register) that might return 401 for validation
        const isAuthEndpoint = endpoint.includes('/login') || endpoint.includes('/register') || endpoint.includes('/firebase');
        if (!isAuthEndpoint) {
          logoutUser();
          throw new Error('Session expired. Please login again.');
        }
      }
      
      // Handle multiple validation errors (array) or single error (string)
      let errorMessage = '';
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        // Multiple validation errors - join them
        errorMessage = errorData.errors.join('. ');
      } else {
        // Single error message
        errorMessage = errorData.error || errorData.message || errorData.details || `Request failed: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API request to ${endpoint} failed:`, error);
    
    // Handle network connectivity issues
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your connection and ensure backend is running.');
    }
    
    throw error;
  }
};

// Email/Password Auth Service Functions - FIXED TO USE password_hash
const loginUser = async (email: string, password: string) => {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password_hash: password }) // FIXED: password_hash instead of password
  }, true); // Skip auto-logout for login endpoint
};

const registerUser = async (name: string, email: string, password: string) => {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password_hash: password }) // FIXED: password_hash instead of password
  }, true); // Skip auto-logout for register endpoint
};

// Get current user profile
const getCurrentUser = async () => {
  return apiRequest('/api/auth/profile');
};

// Update user credits
const updateUserCredits = async (credits: number) => {
  return apiRequest('/api/auth/credits', {
    method: 'POST',
    body: JSON.stringify({ amount: credits })
  });
};

// Firebase Auth Service Functions
const firebaseAuth = async (idToken: string, provider: 'google' | 'apple') => {
  return apiRequest('/api/auth/firebase', {
    method: 'POST',
    body: JSON.stringify({ idToken, provider })
  }, true); // Skip auto-logout for firebase auth endpoint
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMethod, setAuthMethodState] = useState<'email' | 'google' | 'apple' | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getAuthToken();
    const method = getAuthMethod();
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getCurrentUser();
      
      if (data.success) {
        setUser(data.user || data.data?.user);
        setAuthMethodState(method);
        
        // Update local storage with latest user data
        if (data.user) {
          localStorage.setItem('agriseal_user', JSON.stringify(data.user));
        }
      } else {
        logoutUser();
      }
    } catch (error: any) {
      console.error('Auth check failed:', error.message);
      
      // If it's a 401 error, user is not authenticated
      if (error.message.includes('401') || error.message.includes('Session expired')) {
        logoutUser();
      }
      
      // Try alternative endpoint
      try {
        const checkData = await apiRequest('/api/auth/check');
        if (checkData.success && checkData.authenticated) {
          setUser(checkData.user);
          setAuthMethodState(method);
          localStorage.setItem('agriseal_user', JSON.stringify(checkData.user));
        } else {
          logoutUser();
        }
      } catch (checkError) {
        logoutUser();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      
      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }
      
      const userData = data.user || data.data?.user;
      const token = data.token || data.data?.token;
      
      if (!token) {
        throw new Error('Authentication token not received');
      }
      
      setUser(userData);
      setAuthToken(token);
      setAuthMethod('email');
      setAuthMethodState('email');
      localStorage.setItem('agriseal_user', JSON.stringify(userData));
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Signup
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await registerUser(name, email, password);
      
      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }
      
      const userData = data.user || data.data?.user;
      const token = data.token || data.data?.token;
      
      if (!token) {
        throw new Error('Authentication token not received');
      }
      
      setUser(userData);
      setAuthToken(token);
      setAuthMethod('email');
      setAuthMethodState('email');
      localStorage.setItem('agriseal_user', JSON.stringify(userData));
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Signup error:', error);
      // Preserve the actual error message from the API
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In
  const googleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Add scopes for better user info
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      // Send token to backend
      const data = await firebaseAuth(idToken, 'google');
      
      if (!data.success) {
        throw new Error(data.error || 'Google authentication failed');
      }
      
      const userData = data.user || data.data?.user;
      const token = data.token || data.data?.token;
      
      if (!token) {
        throw new Error('Authentication token not received');
      }
      
      setUser(userData);
      setAuthToken(token);
      setAuthMethod('google');
      setAuthMethodState('google');
      localStorage.setItem('agriseal_user', JSON.stringify(userData));
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked by browser. Please allow popups for this site.');
      } else {
        throw new Error(error.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Apple Sign-In
  const appleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      // Send token to backend
      const data = await firebaseAuth(idToken, 'apple');
      
      if (!data.success) {
        throw new Error(data.error || 'Apple authentication failed');
      }
      
      const userData = data.user || data.data?.user;
      const token = data.token || data.data?.token;
      
      if (!token) {
        throw new Error('Authentication token not received');
      }
      
      setUser(userData);
      setAuthToken(token);
      setAuthMethod('apple');
      setAuthMethodState('apple');
      localStorage.setItem('agriseal_user', JSON.stringify(userData));
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked by browser. Please allow popups for this site.');
      } else {
        throw new Error(error.message || 'Apple sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthMethodState(null);
    logoutUser();
  };

  const updateCredits = async (credits: number) => {
    try {
      const data = await updateUserCredits(credits);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update credits');
      }
      
      if (user) {
        const updatedUser = { 
          ...user, 
          credits: data.credits || data.data?.credits || credits 
        };
        setUser(updatedUser);
        localStorage.setItem('agriseal_user', JSON.stringify(updatedUser));
      }
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Failed to update credits:', error);
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      return { ...prevUser, ...userData };
    });
  };

  return (
    <AuthContext.Provider       value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateCredits,
        updateUser,
        googleSignIn,
        appleSignIn,
        authMethod
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};