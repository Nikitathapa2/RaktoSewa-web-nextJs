import axiosInstance from '../axios';
import { API } from '../endpoints';

export const getAdminProfile = async () => {
  try {
    const response = await axiosInstance.get(API.ADMIN.PROFILE.ME);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error?.message || 'Failed to fetch admin profile');
  }
};

export const changeAdminPassword = async (payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  try {
    const response = await axiosInstance.put(API.ADMIN.PROFILE.CHANGE_PASSWORD, payload);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error?.message || 'Failed to update password');
  }
};
