import { API } from "../endpoints";
import axiosInstance from "../axios";

const buildAuthConfig = (token?: string, params?: Record<string, any>) => {
    const config: any = {};

    if (token) {
        config.headers = {
            Authorization: `Bearer ${token}`,
        };
    }

    if (params) {
        config.params = params;
    }

    return config;
}

/**
 * Get campaigns for a specific month (for calendar view)
 * GET /api/v1/campaigns/by-month?year=2024&month=1&page=1&limit=100
 */
export const getCampaignsByMonth = async (
    year: number,
    month: number,
    page: number = 1,
    limit: number = 100,
    token?: string
) => {
    try {
        const response = await axiosInstance.get(
            API.CAMPAIGNS.GET_ALL,
            buildAuthConfig(token, { year, month, page, limit })
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
                error.message ||
                'Failed to fetch campaigns'
        );
    }
};

/**
 * Get all available campaigns (Donor view)
 * GET /api/v1/campaigns?page=1&limit=10
 */
export const getAllCampaigns = async (
    page: number = 1,
    limit: number = 10,
    token?: string
) => {
    try {
        const response = await axiosInstance.get(
            API.CAMPAIGNS.GET_ALL,
            buildAuthConfig(token, { page, limit })
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
                error.message ||
                'Failed to fetch campaigns'
        );
    }
};

/**
 * Get campaigns the donor has applied to
 * GET /api/v1/campaigns/my-applied?page=1&limit=10
 */
export const getMyAppliedCampaigns = async (
    page: number = 1,
    limit: number = 10,
    token?: string
) => {
    try {
        const response = await axiosInstance.get(
            API.CAMPAIGNS.GET_MY_APPLIED,
            buildAuthConfig(token, { page, limit })
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
                error.message ||
                'Failed to fetch applied campaigns'
        );
    }
};

/**
 * Get campaign details by ID
 * GET /api/v1/campaigns/:id
 */
export const getCampaignById = async (campaignId: string, token?: string) => {
    try {
        const response = await axiosInstance.get(
            `${API.CAMPAIGNS.GET_ONE}/${campaignId}`,
            buildAuthConfig(token)
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
                error.message ||
                'Failed to fetch campaign'
        );
    }
};

/**
 * Apply for a campaign
 * POST /api/v1/campaigns/:id/apply
 */
export const applyForCampaign = async (campaignId: string, token?: string) => {
    try {
        const response = await axiosInstance.post(
            `${API.CAMPAIGNS.APPLY}/${campaignId}/apply`,
            {},
            buildAuthConfig(token)
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
                error.message ||
                'Failed to apply for campaign'
        );
    }
};
