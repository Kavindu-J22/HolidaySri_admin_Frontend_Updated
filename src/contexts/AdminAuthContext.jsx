import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { adminAPI } from '../config/api';

// Initial state
const initialState = {
  admin: null,
  token: null,
  loading: true,
  error: null,
};

// Action types
const ADMIN_AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ADMIN: 'SET_ADMIN',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const adminAuthReducer = (state, action) => {
  switch (action.type) {
    case ADMIN_AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ADMIN_AUTH_ACTIONS.SET_ADMIN:
      return {
        ...state,
        admin: action.payload.admin,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case ADMIN_AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ADMIN_AUTH_ACTIONS.LOGOUT:
      return { ...initialState, loading: false };
    case ADMIN_AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const AdminAuthContext = createContext();

// Admin auth provider component
export const AdminAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminAuthReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminUser');

        if (token && adminData) {
          dispatch({
            type: ADMIN_AUTH_ACTIONS.SET_ADMIN,
            payload: {
              admin: JSON.parse(adminData),
              token,
            },
          });
        } else {
          dispatch({ type: ADMIN_AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        // Invalid data in localStorage, clear it
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        dispatch({ type: ADMIN_AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      dispatch({ type: ADMIN_AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ADMIN_AUTH_ACTIONS.CLEAR_ERROR });

      const response = await adminAPI.login(username, password);
      const { token, admin } = response.data;

      // Store in localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(admin));

      dispatch({
        type: ADMIN_AUTH_ACTIONS.SET_ADMIN,
        payload: { admin, token },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: ADMIN_AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    // Update state
    dispatch({ type: ADMIN_AUTH_ACTIONS.LOGOUT });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: ADMIN_AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

// Custom hook to use admin auth context
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
