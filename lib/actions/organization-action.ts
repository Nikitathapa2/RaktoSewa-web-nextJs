'use server';

import { getOrganizationDashboardStats, updateOrganizationProfile, uploadOrganizationPhoto } from '@/lib/api/organization';
import { getMyInventory } from '@/lib/api/inventory';
import { getAuthToken, setUserData, getUserData } from '../cookie';

export const getOrganizationDashboardStatsAction = async () => {
  try {
    console.log('🔐 Server Action: Fetching organization dashboard stats...');
    
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await getOrganizationDashboardStats(token);
    
    console.log('✅ Server Action: Dashboard stats fetched successfully:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Server Action Error:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to fetch dashboard stats',
      data: null,
    };
  }
};

export const updateOrganizationProfileAction = async (orgId: string, profileData: any) => {
  try {
    console.log('🔐 Server Action: Updating organization profile...');
    
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await updateOrganizationProfile(orgId, profileData, token);
    
    if (response.success) {
      // Update user data in cookies
      const currentUser = await getUserData();
      const updatedUser = {
        ...currentUser,
        ...profileData,
      };
      await setUserData(updatedUser);
      console.log('✅ Server Action: Profile updated and cookies refreshed');
    }
    
    return response;
  } catch (error: any) {
    console.error('❌ Server Action Error:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to update organization profile',
      data: null,
    };
  }
};

export const uploadOrganizationPhotoAction = async (photoFormData: FormData) => {
  try {
    console.log('🔐 Server Action: Uploading organization profile picture...');
    
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await uploadOrganizationPhoto(photoFormData, token);
    
    if (response.success) {
      // Update user data with new profile picture
      const currentUser = await getUserData();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          profilePicture: response.data?.profilePicture || currentUser.profilePicture,
        };
        await setUserData(updatedUser);
        console.log('✅ Server Action: Photo uploaded and cookies refreshed');
      }
    }
    
    return response;
  } catch (error: any) {
    console.error('❌ Server Action Error:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to upload profile picture',
      data: null,
    };
  }
};

export const getOrganizationBloodInventoryAction = async (page: number = 1, limit: number = 10) => {
  try {
    console.log('🔐 Server Action: Fetching organization blood inventory...');
    
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await getMyInventory(page, limit, token);
    
    console.log('✅ Server Action: Blood inventory fetched successfully:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Server Action Error:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to fetch blood inventory',
      data: null,
    };
  }
};
