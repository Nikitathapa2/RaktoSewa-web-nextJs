import { API } from '../endpoints';
import axiosInstance from '../axios';

/**
 * Create a new campaign (Admin only)
 * POST /api/v1/admin/campaigns
 * Supports file upload via FormData
 */
export const createCampaign = async (campaignData: FormData) => {
  try {
    const response = await axiosInstance.post(API.ADMIN.CAMPAIGN.CREATE, campaignData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message || error.message || 'Create campaign failed');
  }
};

/**
 * Get all campaigns (Admin only)
 * GET /api/v1/admin/campaigns?page=1&limit=10
 */
export const getAllCampaigns = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await axiosInstance.get(API.ADMIN.CAMPAIGN.GET_ALL, {
      params: { page, limit },
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch campaigns');
  }
};

/**
 * Get a single campaign by ID (Admin only)
 * GET /api/v1/admin/campaigns/:id
 */
export const getCampaignById = async (campaignId: string) => {
  try {
    const response = await axiosInstance.get(`${API.ADMIN.CAMPAIGN.GET_ONE}/${campaignId}`);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch campaign');
  }
};

/**
 * Update a campaign by ID (Admin only)
 * PUT /api/v1/admin/campaigns/:id
 * Supports file upload via FormData
 */
export const updateCampaign = async (campaignId: string, campaignData: FormData) => {
  try {
    const response = await axiosInstance.put(`${API.ADMIN.CAMPAIGN.UPDATE}/${campaignId}`, campaignData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update campaign');
  }
};

/**
 * Delete a campaign by ID (Admin only)
 * DELETE /api/v1/admin/campaigns/:id
 */
export const deleteCampaign = async (campaignId: string) => {
  try {
    const response = await axiosInstance.delete(`${API.ADMIN.CAMPAIGN.DELETE}/${campaignId}`);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete campaign');
  }
};
