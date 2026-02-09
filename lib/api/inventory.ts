import { API } from "./endpoints";
import axiosInstance from "./axios";

/**
 * Get organization's blood inventory
 * GET /api/v1/inventory?page=1&limit=10
 */
export const getMyInventory = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await axiosInstance.get(API.INVENTORY.GET_MY, {
      params: { page, limit }
    });
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
