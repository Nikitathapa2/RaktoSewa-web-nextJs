"use server";
import { registerDonor, registerOrganization, loginDonor, loginOrganization, loginAdmin, requestPasswordReset as apiRequestPasswordReset, verifyOTP as apiVerifyOTP, resetPassword as apiResetPassword, resendOTP as apiResendOTP } from "@/lib/api/auth"
import { LoginSchemaType, RegisterSchemaType } from "@/app/(auth)/schema"
import { setAuthToken, setUserData, clearAuthCookies, getUserData, getAuthToken } from "../cookie"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const handleRegister = async (data: RegisterSchemaType) => {
    try {
        let response;
        
        if (data.userType === 'donor') {
            response = await registerDonor(data)
            console.log('handleDonorRegister response:', response);
        } else if (data.userType === 'organization') {
            response = await registerOrganization(data)
            console.log('handleOrganizationRegister response:', response);
        }
        
        if (response && response.success) {
            return {
                success: true,
                message: response.message || 'Registration successful',
                data: response.data
            }
        }
        return {
            success: false,
            message: response?.message || 'Registration failed'
        }
    } catch (error: any) {
        console.error('handleRegister error:', error);
        return { 
            success: false, 
            message: error.message || 'Registration action failed' 
        }
    }
}

export const handleLogin = async (data: LoginSchemaType, userType: "donor" | "organization") => {
    try {
        let response;
        
        if (userType === 'donor') {
            response = await loginDonor(data)
            console.log('handleDonorLogin response:', response);
        } else if (userType === 'organization') {
            response = await loginOrganization(data)
            console.log('handleOrganizationLogin response:', response);
        }
        
        if (response && response.success) {
            await setAuthToken(response.token)
            await setUserData(response.data)
            return {
                success: true,
                message: response.message || 'Login successful',
                data: response
            }
        }
        return {
            success: false,
            message: response?.message || 'Login failed'
        }
    } catch (error: any) {
        console.error('handleLogin error:', error);
        return { 
            success: false, 
            message: error.message || 'Login action failed' 
        }
    }
}


export const getCurrentUser = async () => {
    try {
        const userData = await getUserData();
        const token = await getAuthToken();
        
        if (!userData || !token) {
            return null;
        }
        
        return {
            user: userData,
            token
        };
    } catch (error) {
        console.error('getCurrentUser error:', error);
        return null;
    }
}


export const handleAdminLogin = async (data: LoginSchemaType) => {
    try {
        const response = await loginAdmin(data);
        console.log('handleAdminLogin response:', response);
        
        if (response && response.success) {
            await setAuthToken(response.token);
            await setUserData(response.user);
            
            return {
                success: true,
                message: response.message || 'Admin login successful',
                token: response.token,
                user: response.user
            }
        }
        
        return {
            success: false,
            message: response?.message || 'Invalid email or password'
        }
    } catch (error: any) {
        console.error('handleAdminLogin error:', error);
        return { 
            success: false, 
            message: error.message || 'Login action failed' 
        }
    }
}

export const handleLogout = async () => {
    await clearAuthCookies();
    revalidatePath('/', 'layout');
    redirect('/login');
}

export const updateUserDataInCookies = async (userData: any) => {
    try {
        await setUserData(userData);
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update user data in cookies:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Password Reset Actions
 */

export const handleForgotPassword = async (email: string, userType: "donor" | "organization") => {
    try {
        const response = await apiRequestPasswordReset(email, userType);
        return {
            success: true,
            message: response.message || "OTP sent successfully"
        }
    } catch (error: any) {
        console.error('handleForgotPassword error:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to send OTP"
        }
    }
}

export const handleVerifyOTP = async (email: string, otp: string, userType: "donor" | "organization") => {
    try {
        const response = await apiVerifyOTP(email, otp, userType);
        return {
            success: true,
            message: response.message || "OTP verified successfully"
        }
    } catch (error: any) {
        console.error('handleVerifyOTP error:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "OTP verification failed"
        }
    }
}

export const handleResetPassword = async (
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string,
    userType: "donor" | "organization"
) => {
    try {
        const response = await apiResetPassword(email, otp, newPassword, confirmPassword, userType);
        return {
            success: true,
            message: response.message || "Password reset successfully"
        }
    } catch (error: any) {
        console.error('handleResetPassword error:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Password reset failed"
        }
    }
}

export const handleResendOTP = async (email: string, userType: "donor" | "organization") => {
    try {
        const response = await apiResendOTP(email, userType);
        return {
            success: true,
            message: response.message || "OTP resent successfully"
        }
    } catch (error: any) {
        console.error('handleResendOTP error:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to resend OTP"
        }
    }
}
