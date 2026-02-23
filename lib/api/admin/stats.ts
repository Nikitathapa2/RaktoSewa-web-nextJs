import axiosInstance from '../axios';
import { API } from '../endpoints';

export interface AdminDashboardStats {
  totalDonors: number;
  ongoingCampaigns: number;
  totalBloodUnits: number;
  totalRegisteredOrganizations: number;
}

const buildAuthConfig = (token?: string) => {
  if (!token) return {};

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAdminDashboardStats = async (token?: string) => {
  try {
    const response = await axiosInstance.get(API.ADMIN.STATS.DASHBOARD, buildAuthConfig(token));
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error?.message || 'Failed to fetch dashboard stats');
  }
};
