import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to easily access user details and authentication state
 * @returns {Object} User details and authentication utilities
 */
export const useUserDetails = () => {
  const { user, role, isAuthenticated, token, loading, error } = useAuth();

  return {
    // User data
    user,
    role,
    isAuthenticated,
    token,
    loading,
    error,
    
    // Computed properties
    isAdmin: role === 'admin',
    isUser: role === 'User',
    isLoggedIn: isAuthenticated,
    
    // User info helpers
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    userId: user?._id || user?.id || '',
    
    // Display helpers
    displayName: user ? (user.firstName || user.email || 'User') : 'Guest',
    userInitials: user ? 
      `${(user.firstName || '').charAt(0)}${(user.lastName || '').charAt(0)}`.toUpperCase() : 
      'G',
  };
};

export default useUserDetails;
