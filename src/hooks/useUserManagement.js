import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { toast } from 'sonner';

// Query keys
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (params) => [...userKeys.lists(), params],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
  stats: () => [...userKeys.all, 'stats'],
};

// Get users with pagination and filters
export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Get user by ID
export const useUser = (userId) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get user statistics
export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: userService.getUserStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success('User created successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create user';
      toast.error(message);
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }) => userService.updateUser(userId, userData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success('User updated successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update user';
      toast.error(message);
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success('User deleted successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
    },
  });
};

// Toggle user status mutation
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }) => userService.toggleUserStatus(userId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      const action = variables.status === 'Active' ? 'activated' : 'suspended';
      toast.success(`User ${action} successfully!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update user status';
      toast.error(message);
    },
  });
};

// Update user role mutation
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }) => userService.updateUserRole(userId, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success('User role updated successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update user role';
      toast.error(message);
    },
  });
};

// Bulk delete users mutation
export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.bulkDeleteUsers,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success(`${variables.userIds.length} users deleted successfully!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete users';
      toast.error(message);
    },
  });
};

// Bulk update status mutation
export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, status }) => userService.bulkUpdateStatus(userIds, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      const action = variables.status === 'Active' ? 'activated' : 'suspended';
      toast.success(`${variables.userIds.length} users ${action} successfully!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update user status';
      toast.error(message);
    },
  });
};

// Bulk update role mutation
export const useBulkUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, role }) => userService.bulkUpdateRole(userIds, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      toast.success(`${variables.userIds.length} users role updated successfully!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update user roles';
      toast.error(message);
    },
  });
};
