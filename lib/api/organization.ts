import axiosInstance from './axios';
import { API } from './endpoints';

const buildAuthConfig = (token?: string) => {
  const config: any = {};
  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
};

export const getOrganizationDashboardStats = async (token?: string) => {
  try {
    console.log('📊 Fetching organization dashboard stats...');
    console.log('🔐 Token:', token ? '✅ Present' : '❌ Missing');
    
    const response = await axiosInstance.get(
      API.ORGANIZATION.DASHBOARD_STATS,
      buildAuthConfig(token)
    );

    console.log('✅ Dashboard stats received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching dashboard stats:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
  }
};

export const updateOrganizationProfile = async (orgId: string, profileData: any, token?: string) => {
  try {
    console.log('📝 Updating organization profile...');
    
    const response = await axiosInstance.put(
      `${API.PROFILE.ORGANIZATION.UPDATE}/${orgId}`,
      profileData,
      buildAuthConfig(token)
    );

    console.log('✅ Profile updated:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating profile:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update organization profile');
  }
};

export const uploadOrganizationPhoto = async (photoFormData: FormData, token?: string) => {
  try {
    console.log('📸 Uploading organization profile picture...');
    
    const response = await axiosInstance.post(
      API.PROFILE.ORGANIZATION.UPLOAD_PHOTO,
      photoFormData,
      {
        ...buildAuthConfig(token),
        headers: {
          ...buildAuthConfig(token).headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('✅ Photo uploaded:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error uploading photo:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to upload profile picture');
  }
};
