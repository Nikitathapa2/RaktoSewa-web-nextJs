"use server";
import { registerDonor, registerOrganization, loginDonor, loginOrganization } from "@/lib/api/auth"
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


export const handleLogout = async () => {
    await clearAuthCookies();
    revalidatePath('/', 'layout');
    redirect('/login');
}