import { API } from "./endpoints";
import axiosInstance from "./axios";

/**
 * Create a new campaign (Organization only)
 * POST /api/v1/campaigns
 * Supports file upload via FormData
 */
export const createCampaign = async (campaignData: FormData) => {
    try {
        const response = await axiosInstance.post(
            API.CAMPAIGNS.CREATE,
            campaignData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Create campaign failed');
    }
}

/**
 * Get all campaigns created by the logged-in organization
 * GET /api/v1/campaigns/my-campaigns?page=1&limit=10
 */
export const getMyCampaigns = async (page: number = 1, limit: number = 10) => {
    try {
        const response = await axiosInstance.get(API.CAMPAIGNS.GET_MY, {
            params: { page, limit }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to fetch campaigns');
    }
}

/**
 * Get a single campaign by ID (Organization only)
 * GET /api/v1/campaigns/:id
 */
export const getCampaignById = async (campaignId: string) => {
    try {
        const response = await axiosInstance.get(`${API.CAMPAIGNS.GET_ONE}/${campaignId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to fetch campaign');
    }
}

/**
 * Update a campaign by ID (Organization only)
 * PUT /api/v1/campaigns/:id
 * Supports file upload via FormData
 */
export const updateCampaign = async (campaignId: string, campaignData: FormData) => {
    try {
        const response = await axiosInstance.put(
            `${API.CAMPAIGNS.UPDATE}/${campaignId}`,
            campaignData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to update campaign');
    }
}

/**
 * Delete a campaign by ID (Organization only)
 * DELETE /api/v1/campaigns/:id
 */
export const deleteCampaign = async (campaignId: string) => {
    try {
        const response = await axiosInstance.delete(`${API.CAMPAIGNS.DELETE}/${campaignId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to delete campaign');
    }
}

/**
 * Get all available campaigns (Donor only)
 * GET /api/v1/campaigns?page=1&limit=10
 */
export const getAllCampaigns = async (page: number = 1, limit: number = 10) => {
    try {
        const response = await axiosInstance.get(API.CAMPAIGNS.GET_ALL, {
            params: { page, limit }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to fetch campaigns');
    }
}

/**
 * Get campaigns the donor has applied to (Donor only)
 * GET /api/v1/campaigns/my-applied?page=1&limit=10
 */
export const getMyAppliedCampaigns = async (page: number = 1, limit: number = 10) => {
    try {
        const response = await axiosInstance.get(API.CAMPAIGNS.GET_MY_APPLIED, {
            params: { page, limit }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to fetch applied campaigns');
    }
}

/**
 * Apply for a campaign (Donor only)
 * POST /api/v1/campaigns/:id/apply
 */
export const applyForCampaign = async (campaignId: string) => {
    try {
        const response = await axiosInstance.post(`${API.CAMPAIGNS.APPLY}/${campaignId}/apply`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to apply for campaign');
    }
}

/**
 * Get campaign participants/applicants (Organization only)
 * GET /api/v1/campaigns/:id/participants?page=1&limit=10
 */
export const getCampaignParticipants = async (campaignId: string, page: number = 1, limit: number = 10) => {
    try {
        const response = await axiosInstance.get(`${API.CAMPAIGNS.GET_PARTICIPANTS}/${campaignId}/participants`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to fetch campaign participants');
    }
}

/**
 * Remove an applicant from a campaign (Organization only)
 * DELETE /api/v1/campaigns/:id/applicants/:applicantId
 */
export const removeApplicantFromCampaign = async (campaignId: string, applicantId: string) => {
    try {
        const response = await axiosInstance.delete(`${API.CAMPAIGNS.GET_PARTICIPANTS}/${campaignId}/applicants/${applicantId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to remove applicant from campaign');
    }
}