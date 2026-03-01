import { API } from "./endpoints";
import axiosInstance from "./axios";

const buildAuthConfig = (token?: string) => {
  if (!token) return undefined;

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Donor Profile - Update
 * PUT /api/v1/donor/:id
 */
export const updateDonorProfile = async (donorId: string, profileData: {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  bloodGroup?: string;
}, token?: string) => {
  try {
    const response = await axiosInstance.put(
      `${API.PROFILE.DONOR.UPDATE}/${donorId}`,
      profileData,
      buildAuthConfig(token)
    );
    return response.data;
  } catch (error: any) {
    console.error('updateDonorProfile error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Donor Profile - Upload Photo
 * POST /api/v1/donor/upload-photo
 */
export const uploadDonorProfilePhoto = async (file: File, token?: string) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await axiosInstance.post(
      API.PROFILE.DONOR.UPLOAD_PHOTO,
      formData,
      buildAuthConfig(token)
    );
    return response.data;
  } catch (error: any) {
    console.error('uploadDonorProfilePhoto error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Organization Profile - Update
 * PUT /api/v1/organization/:id
 */
export const updateOrganizationProfile = async (
  organizationId: string,
  profileData: {
    organizationName?: string;
    headOfOrganization?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
  },
  token?: string
) => {
  try {
    const response = await axiosInstance.put(
      `${API.PROFILE.ORGANIZATION.UPDATE}/${organizationId}`,
      profileData,
      buildAuthConfig(token)
    );
    return response.data;
  } catch (error: any) {
    console.error('updateOrganizationProfile error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Organization Profile - Upload Photo
 * POST /api/v1/organization/upload-photo
 */
export const uploadOrganizationProfilePhoto = async (file: File, token?: string) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await axiosInstance.post(
      API.PROFILE.ORGANIZATION.UPLOAD_PHOTO,
      formData,
      buildAuthConfig(token)
    );
    return response.data;
  } catch (error: any) {
    console.error('uploadOrganizationProfilePhoto error:', error);
    throw error.response?.data || error;
  }
};
