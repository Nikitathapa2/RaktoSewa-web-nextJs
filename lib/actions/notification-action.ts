'use server';

import { getNotifications } from '@/lib/api/notifications';
import { getAuthToken } from '../cookie';

export const handleGetNotifications = async () => {
    try {
        const token = await getAuthToken();

        if (!token) {
            return { success: false, message: 'Authentication required', data: null };
        }

        const result = await getNotifications(token);

        return { success: true, data: result.data || [] };
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        return { success: false, message: error.message, data: null };
    }
};
