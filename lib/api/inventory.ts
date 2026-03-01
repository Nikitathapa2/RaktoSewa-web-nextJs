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
}

/**
 * Get all blood stock across all organizations (Donor - read only)
 * GET /api/v1/inventory/all-stock?page=1&limit=10
 */
export const getAllBloodStock = async (
  page: number = 1,
  limit: number = 10,
  token?: string
) => {
  try {
    const params = { page, limit };
    console.log('🌐 getAllBloodStock - Token:', token ? '✅ Present' : '❌ Missing');
    console.log('🌐 getAllBloodStock - Params:', params);

    const response = await axiosInstance.get(
      API.INVENTORY.GET_ALL,
      buildAuthConfig(token, params)
    );

    console.log('🌐 getAllBloodStock - Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('🌐 getAllBloodStock - Error:', error);
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to fetch blood stock');
  }
}

/**
 * Get organization's blood inventory
 * GET /api/v1/inventory?page=1&limit=10
 */
export const getMyInventory = async (page: number = 1, limit: number = 10, token?: string) => {
  try {
    const response = await axiosInstance.get(API.INVENTORY.GET_MY, 
      buildAuthConfig(token, { page, limit })
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to fetch inventory');
  }
}

/**
 * Update blood inventory for a blood group
 * POST /api/v1/inventory/update
 */
export const updateInventory = async (updateData: {
  bloodGroup: string;
  quantity: number;
  operation?: 'add' | 'subtract' | 'set';
}) => {
  try {
    const response = await axiosInstance.post(
      API.INVENTORY.UPDATE,
      {
        ...updateData,
        operation: updateData.operation || 'set' // Default to 'set' operation
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to update inventory');
  }
}

/**
 * Delete blood group from inventory
 * DELETE /api/v1/inventory/:bloodGroup
 */
export const deleteInventory = async (bloodGroup: string) => {
  try {
    const response = await axiosInstance.delete(
      `${API.INVENTORY.DELETE}/${bloodGroup}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to delete inventory item');
  }
}
