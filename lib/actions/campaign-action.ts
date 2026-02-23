'use server';

import { getAllCampaigns, getMyAppliedCampaigns, getPublicCampaigns } from '@/lib/api/campaigns';
import { getAuthToken } from '@/lib/cookie';

export const getAllCampaignsAction = async (
  page: number = 1,
  limit: number = 10,
  filters?: { search?: string; location?: string; sortBy?: string }
) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication token missing. Please login again.',
      };
    }

    return await getAllCampaigns(page, limit, token, filters);
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to fetch campaigns',
    };
  }
};

export const getPublicCampaignsAction = async (limit: number = 3) => {
  try {
    const result = await getPublicCampaigns(limit);
    return {
      success: true,
      data: result?.data || result?.campaigns || [],
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to fetch campaigns',
      data: [],
    };
  }
};

export const getMyAppliedCampaignsAction = async (page: number = 1, limit: number = 10) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'Authentication token missing. Please login again.',
      };
    }

    return await getMyAppliedCampaigns(page, limit, token);
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to fetch applied campaigns',
    };
  }
};
