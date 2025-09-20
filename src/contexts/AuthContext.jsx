import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role,
        loading: false,
        error: null,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        role: null,
        loading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        role: null,
        loading: false,
        error: null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  role: null,
  loading: false,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const userData = localStorage.getItem('userData');
      
      if (token && role && userData) {
        try {
          const user = JSON.parse(userData);
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user,
              token,
              role,
            },
          });
          
          // Set default axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userData');
        }
      }
    };

    initializeAuth();
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (state.isAuthenticated && state.token && state.role && state.user) {
      localStorage.setItem('token', state.token);
      localStorage.setItem('role', state.role);
      localStorage.setItem('userData', JSON.stringify(state.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else if (!state.isAuthenticated) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userData');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.isAuthenticated, state.token, state.role, state.user]);

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });

      const { token, role, user } = response.data;
      
      if (token && user) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user,
            token,
            role,
          },
        });
        return { success: true, role };
      } else {
        throw new Error('No token or user data received');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
