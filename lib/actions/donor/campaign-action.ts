'use server';

import { getCampaignsByMonth } from '@/lib/api/donor/campaigns';
import { getAuthToken } from '@/lib/cookie';

export const handleGetCampaignsByMonth = async (
    year: number,
    month: number,
    page: number = 1,
    limit: number = 100
) => {
    try {
        const token = await getAuthToken();

        if (!token) {
            return { success: false, message: 'Authentication required', data: null };
        }

        const result = await getCampaignsByMonth(year, month, page, limit, token);

        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error fetching campaigns by month:', error);
        return { success: false, message: error.message, data: null };
    }
};
