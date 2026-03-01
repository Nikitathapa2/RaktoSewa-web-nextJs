'use server';

import {
  updateDonorProfile as apiUpdateDonorProfile,
  uploadDonorProfilePhoto as apiUploadDonorProfilePhoto,
  updateOrganizationProfile as apiUpdateOrganizationProfile,
  uploadOrganizationProfilePhoto as apiUploadOrganizationProfilePhoto,
} from '@/lib/api/profile';
import { getAuthToken, setUserData } from '@/lib/cookie';

/**
 * Update Donor Profile
 * Accepts profile data and updates the donor user
 */
export const updateDonorProfileAction = async (
  donorId: string,
  profileData: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: string;
    bloodGroup?: string;
  }
) => {
  try {
    const token = await getAuthToken();
    const response = await apiUpdateDonorProfile(donorId, profileData, token || undefined);

    if (response?.success) {
      // Update local user data in cookies
      if (response.data) {
        await setUserData(response.data);
      }

      return {
        success: true,
        message: response.message || 'Profile updated successfully',
        data: response.data,
      };
    }

    return {
      success: false,
      message: response?.message || 'Failed to update profile',
    };
  } catch (error: any) {
    console.error('updateDonorProfileAction error:', error);
    return {
      success: false,
      message: error?.message || 'Failed to update profile',
    };
  }
};

/**
 * Upload Donor Profile Picture
 * Uploads profile picture for donor
 */
export const uploadDonorProfilePhotoAction = async (file: File) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication token missing. Please login again.',
      };
    }

    const response = await apiUploadDonorProfilePhoto(file, token);

    if (response?.success) {
      return {
        success: true,
        message: response.message || 'Profile picture uploaded successfully',
        data: response.data,
      };
    }

    return {
      success: false,
      message: response?.message || 'Failed to upload profile picture',
    };
  } catch (error: any) {
    console.error('uploadDonorProfilePhotoAction error:', error);
    return {
      success: false,
      message: error?.message || 'Failed to upload profile picture',
    };
  }
};

/**
 * Update Organization Profile
 * Accepts profile data and updates the organization user
 */
export const updateOrganizationProfileAction = async (
  organizationId: string,
  profileData: {
    organizationName?: string;
    headOfOrganization?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
  }
) => {
  try {
    const token = await getAuthToken();
    const response = await apiUpdateOrganizationProfile(organizationId, profileData, token || undefined);

    if (response?.success) {
      // Update local user data in cookies
      if (response.data) {
        await setUserData(response.data);
      }

      return {
        success: true,
        message: response.message || 'Profile updated successfully',
        data: response.data,
      };
    }

    return {
      success: false,
      message: response?.message || 'Failed to update profile',
    };
  } catch (error: any) {
    console.error('updateOrganizationProfileAction error:', error);
    return {
      success: false,
      message: error?.message || 'Failed to update profile',
    };
  }
};

/**
 * Upload Organization Profile Picture
 * Uploads profile picture for organization
 */
export const uploadOrganizationProfilePhotoAction = async (file: File) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication token missing. Please login again.',
      };
    }

    const response = await apiUploadOrganizationProfilePhoto(file, token);

    if (response?.success) {
      return {
        success: true,
        message: response.message || 'Profile picture uploaded successfully',
        data: response.data,
      };
    }

    return {
      success: false,
      message: response?.message || 'Failed to upload profile picture',
    };
  } catch (error: any) {
    console.error('uploadOrganizationProfilePhotoAction error:', error);
    return {
      success: false,
      message: error?.message || 'Failed to upload profile picture',
    };
  }
};
