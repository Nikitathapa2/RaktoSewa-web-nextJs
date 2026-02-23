import { API } from "./endpoints";
import axiosInstance from "./axios";

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
};

/**
 * Get all notifications for the logged-in user
 * GET /api/v1/notifications
 */
export const getNotifications = async (token?: string) => {
    try {
        const response = await axiosInstance.get(
            API.NOTIFICATIONS.GET_ALL,
            buildAuthConfig(token)
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
                error.message ||
                'Failed to fetch notifications'
        );
    }
};
