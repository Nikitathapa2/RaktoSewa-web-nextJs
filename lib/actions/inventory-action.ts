'use server';

import { getAllBloodStock } from '@/lib/api/inventory';
import { getAuthToken } from '@/lib/cookie';

export const getAllBloodStockAction = async (
  page: number = 1,
  limit: number = 10
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

    console.log('🔍 getAllBloodStockAction - Token:', token ? '✅ Present' : '❌ Missing');
    console.log('🔍 getAllBloodStockAction - Page:', page, 'Limit:', limit);

    const result = await getAllBloodStock(page, limit, token);
    console.log('✅ getAllBloodStockAction - Result:', result);

    return result;
  } catch (error: any) {
    console.error('❌ getAllBloodStockAction - Error:', error);
    return {
      success: false,
      message: error?.message || 'Failed to fetch blood stock',
    };
  }
};
