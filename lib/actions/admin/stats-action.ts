"use server";

import { getAdminDashboardStats as getAdminDashboardStatsAPI } from '@/lib/api/admin/stats';
import { getAuthToken } from '@/lib/cookie';

export const handleGetAdminDashboardStats = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication token missing. Please login again.',
      };
    }

    const response = await getAdminDashboardStatsAPI(token);

    return {
      success: true,
      data: response?.data,
      message: response?.message || 'Fetched dashboard stats successfully',
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch dashboard stats',
    };
  }
};
