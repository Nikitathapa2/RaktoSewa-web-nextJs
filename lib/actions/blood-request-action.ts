'use server';

import { getAllBloodRequests, getMyAcceptedBloodRequests } from '@/lib/api/bloodRequests';
import { getAuthToken } from '@/lib/cookie';

export const getAllBloodRequestsAction = async (
  page: number = 1,
  limit: number = 10,
  filters?: { bloodGroup?: string; location?: string; urgency?: string }
) => {
  try {
    // Get authentication token from server session
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication token missing. Please login again.',
      };
    }

    // Only pass filters that have actual values
    const cleanedFilters = filters
      ? {
          ...(filters.bloodGroup && { bloodGroup: filters.bloodGroup }),
          ...(filters.location && { location: filters.location }),
          ...(filters.urgency && { urgency: filters.urgency }),
        }
      : undefined;

    console.log('🔍 getAllBloodRequestsAction - Token:', token ? '✅ Present' : '❌ Missing');
    console.log('🔍 getAllBloodRequestsAction - Filters:', cleanedFilters, 'Page:', page, 'Limit:', limit);
    
    const result = await getAllBloodRequests(page, limit, token, cleanedFilters);
    console.log('✅ getAllBloodRequestsAction - Result:', result);
    
    return result;
  } catch (error: any) {
    console.error('❌ getAllBloodRequestsAction - Error:', error);
    return {
      success: false,
      message: error?.message || 'Failed to fetch blood requests',
    };
  }
};

export const getMyAcceptedBloodRequestsAction = async (page: number = 1, limit: number = 10) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication token missing. Please login again.',
      };
    }
    return await getMyAcceptedBloodRequests(page, limit, token);
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to fetch accepted blood requests',
    };
  }
};
