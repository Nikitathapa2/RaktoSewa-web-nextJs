"use server";
import { createUser, getAllUsers as getAllUsersAPI } from "@/lib/api/admin/user";
import { get } from "http";
import { revalidatePath } from 'next/cache';
import { success } from "zod";

export const handleCreateUser = async (data: FormData) => {
    try {
        const response = await createUser(data)
        if (response.success) {
            revalidatePath('/admin/users');
            return {
                success: true,
                message: 'Registration successful',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Registration failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Registration action failed' }
    }
}
        


export const handlegetAllUsers = async () => {
    try {
        const response = await getAllUsersAPI();
        return{
            success: true,
            data: response.data,
            message: 'Fetched all users successfully'

        }
    } catch (error: Error | any) {
        throw new Error(error.message || 'Get all users action failed');
    }
}