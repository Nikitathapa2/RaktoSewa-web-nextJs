import { API } from "./endpoints";
import axiosInstance from "./axios";

/**
 * Get donation history for the logged-in user (Donor)
 * GET /api/v1/donations/history?page=1&limit=10
 */
export const getDonationHistory = async (page: number = 1, limit: number = 10) => {
    try {
        const response = await axiosInstance.get(API.DONATIONS.GET_HISTORY, {
            params: { page, limit }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to fetch donation history');
    }
}

/**
 * Register a walk-in donation (Organization only, for reference)
 * POST /api/v1/donations/walkin
 */
export const registerWalkinDonation = async (donationData: any) => {
    try {
        const response = await axiosInstance.post(API.DONATIONS.REGISTER_WALKIN, donationData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to register walk-in donation');
    }
}

/**
 * Register a donation (Organization only, for reference)
 * POST /api/v1/donations/register
 */
export const registerDonation = async (donationData: any) => {
    try {
        const response = await axiosInstance.post(API.DONATIONS.REGISTER_DONATION, donationData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to register donation');
    }
}
