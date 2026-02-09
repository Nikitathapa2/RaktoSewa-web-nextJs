import { API } from "../endpoints";
import axiosInstance from "../axios";

/**
 * Create a new user (Admin only)
 * POST /api/admin/users
 * Supports file upload via FormData
 */
export const createUser = async (userData: FormData) => {
    try {
        const response = await axiosInstance.post(
            API.ADMIN.USER.CREATE,
            userData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Create user failed');
    }
}

/**
 * Get all users (Admin only)
 * GET /api/admin/users
 */
export const getAllUsers = async () => {
    try {
        const response = await axiosInstance.get(API.ADMIN.USER.GET_ALL);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to fetch users');
    }
}

/**
 * Get a single user by ID (Admin only)
 * GET /api/admin/users/:id
 */
export const getUserById = async (userId: string) => {
    try {
        const response = await axiosInstance.get(`${API.ADMIN.USER.GET_ONE}/${userId}`);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to fetch user');
    }
}

/**
 * Update a user by ID (Admin only)
 * PUT /api/admin/users/:id
 * Supports file upload via FormData
 */
export const updateUser = async (userId: string, userData: FormData) => {
    try {
        const response = await axiosInstance.put(
            `${API.ADMIN.USER.UPDATE}/${userId}`,
            userData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to update user');
    }
}

/**
 * Delete a user by ID (Admin only)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (userId: string) => {
    try {
        const response = await axiosInstance.delete(`${API.ADMIN.USER.DELETE}/${userId}`);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to delete user');
    }
}   