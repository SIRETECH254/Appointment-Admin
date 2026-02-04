import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../api';
import type {
  AdminCreateUserPayload,
  AssignRolePayload,
  ChangePasswordPayload,
  GetCustomersParams,
  GetUsersParams,
  SetUserAdminPayload,
  UpdateNotificationPreferencesPayload,
  UpdateProfilePayload,
  UpdateUserStatusPayload,
} from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get own profile
export const useGetProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update own profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: UpdateProfilePayload | FormData) => {
      const response = await userAPI.updateProfile(profileData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      console.log('Profile updated successfully');
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      console.error('Error:', errorMessage);
    },
  });
};

// Change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData: ChangePasswordPayload) => {
      const response = await userAPI.changePassword(passwordData);
      return response.data.data;
    },
    onSuccess: () => {
      console.log('Password changed successfully');
    },
    onError: (error: any) => {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      console.error('Error:', errorMessage);
    },
  });
};

// Get notification preferences
export const useGetNotificationPreferences = () => {
  return useQuery({
    queryKey: ['user', 'notification-preferences'],
    queryFn: async () => {
      const response = await userAPI.getNotificationPreferences();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update notification preferences
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: UpdateNotificationPreferencesPayload) => {
      const response = await userAPI.updateNotificationPreferences(preferences);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notification-preferences'] });
      console.log('Notification preferences updated successfully');
    },
    onError: (error: any) => {
      console.error('Update notification preferences error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update notification preferences';
      console.error('Error:', errorMessage);
    },
  });
};

// Get all users (admin)
export const useGetAllUsers = (params: GetUsersParams = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await userAPI.getAllUsers(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single user (admin)
export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await userAPI.getUserById(userId);
      return response.data.data;
    },
    enabled: !!userId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update user (admin)
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: Partial<AdminCreateUserPayload> }) => {
      const response = await userAPI.updateUser(userId, userData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      console.log('User updated successfully');
    },
    onError: (error: any) => {
      console.error('Update user error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      console.error('Error:', errorMessage);
    },
  });
};

// Create admin user (super admin)
export const useAdminCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: AdminCreateUserPayload) => {
      const response = await userAPI.adminCreateUser(userData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log('User created successfully');
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      console.error('Error:', errorMessage);
    },
  });
};

// Update user status (super admin)
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, statusData }: { userId: string; statusData: UpdateUserStatusPayload }) => {
      const response = await userAPI.updateUserStatus(userId, statusData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      console.log('User status updated successfully');
    },
    onError: (error: any) => {
      console.error('Update user status error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user status';
      console.error('Error:', errorMessage);
    },
  });
};

// Set user as admin (super admin)
export const useSetUserAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, adminData }: { userId: string; adminData: SetUserAdminPayload }) => {
      const response = await userAPI.setUserAdmin(userId, adminData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      console.log('User admin role updated successfully');
    },
    onError: (error: any) => {
      console.error('Set user admin error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user admin role';
      console.error('Error:', errorMessage);
    },
  });
};

// Get user roles (admin)
export const useGetUserRoles = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId, 'roles'],
    queryFn: async () => {
      const response = await userAPI.getUserRoles(userId);
      return response.data.data;
    },
    enabled: !!userId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Delete user (super admin)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await userAPI.deleteUser(userId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log('User deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      console.error('Error:', errorMessage);
    },
  });
};

// Get customers (users with customer role)
export const useGetCustomers = (params: GetCustomersParams = {}) => {
  return useQuery({
    queryKey: ['users', 'customers', params],
    queryFn: async () => {
      const response = await userAPI.getCustomers(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Assign role to user (admin)
export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleData }: { userId: string; roleData: AssignRolePayload }) => {
      const response = await userAPI.assignRole(userId, roleData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId, 'roles'] });
      console.log('Role assigned successfully');
    },
    onError: (error: any) => {
      console.error('Assign role error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to assign role';
      console.error('Error:', errorMessage);
    },
  });
};

// Remove role from user (admin)
export const useRemoveRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const response = await userAPI.removeRole(userId, roleId);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId, 'roles'] });
      console.log('Role removed successfully');
    },
    onError: (error: any) => {
      console.error('Remove role error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove role';
      console.error('Error:', errorMessage);
    },
  });
};
