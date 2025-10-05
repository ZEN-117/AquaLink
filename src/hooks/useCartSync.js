import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const API_BASE = "http://localhost:5000";

export const useCartSync = () => {
  const { user } = useAuth();
  const { getItemCount, resetCart } = useCart();
  const [backendCartCount, setBackendCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCartCount = useCallback(async () => {
    if (!user?.email) {
      setBackendCartCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_BASE}/api/cart/${user.email}`);
      
      // Ensure we have valid data structure
      if (!data || !Array.isArray(data.items)) {
        setBackendCartCount(0);
        return;
      }
      
      // Calculate number of unique items (not total quantity)
      const totalItems = data.items.filter(item => {
        const quantity = Number(item.quantity) || 0;
        return quantity > 0;
      }).length;
      
      setBackendCartCount(totalItems);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
      setBackendCartCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  // Reset cart count when user logs out
  useEffect(() => {
    if (!user?.email) {
      setBackendCartCount(0);
      resetCart(); // Clear the frontend cart context as well
    }
  }, [user?.email, resetCart]);

  // Listen for custom cart update events
  useEffect(() => {
    const handleCartUpdate = () => {
      // Small delay to ensure backend has processed the update
      setTimeout(() => {
        fetchCartCount();
      }, 100);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [fetchCartCount]);

  // Return the backend cart count if user is authenticated, otherwise use frontend context
  const getTotalItemCount = () => {
    if (user?.email) {
      return backendCartCount;
    }
    return getItemCount();
  };

  return {
    cartCount: getTotalItemCount(),
    isLoading,
    refreshCart: fetchCartCount
  };
};
