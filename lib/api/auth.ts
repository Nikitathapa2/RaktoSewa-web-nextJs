import { LoginSchemaType, RegisterSchemaType } from "@/app/(auth)/schema"
import axiosInstance from "./axios"
import { API } from "./endpoints"


export const registerDonor = async (registerData: RegisterSchemaType) => {
    try {
        const response = await axiosInstance.post(API.AUTH.DONOR.REGISTER, registerData)
        return response.data
    } catch (error: any) {
        console.error('registerDonor error:', error);
        throw error;
    }
}

export const registerOrganization = async (registerData: RegisterSchemaType) => {
    try {
        const response = await axiosInstance.post(API.AUTH.ORGANIZATION.REGISTER, registerData)
        return response.data
    } catch (error: any) {
        console.error('registerOrganization error:', error);
        throw error;
    }
}

export const loginDonor = async (loginData: LoginSchemaType) => {
    try {
        const response = await axiosInstance.post(API.AUTH.DONOR.LOGIN, loginData)
        return response.data
    } catch (error: any) {
        console.error('loginDonor error:', error);
        throw error;
    }
}

export const loginOrganization = async (loginData: LoginSchemaType) => {
    try {
        const response = await axiosInstance.post(API.AUTH.ORGANIZATION.LOGIN, loginData)
        return response.data
    } catch (error: any) {
        console.error('loginOrganization error:', error);
        throw error;
    }
}

/**
 * Admin login
 * POST /admin/login
 */
export const loginAdmin = async (loginData: LoginSchemaType) => {
    try {
        const response = await axiosInstance.post(API.AUTH.ADMIN.LOGIN, loginData)
        return response.data
    } catch (error: any) {
        console.error('loginAdmin error:', error);
        throw error;
    }
}

export const whoAmI = async () => {
  try {
    const response = await axiosInstance.get(API.AUTH.WHOAMI);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Whoami failed');
  }
}

export const updateProfile = async (profileData: FormData) => {
  try {
    const response = await axiosInstance.put(
      API.AUTH.UPDATEPROFILE,
      profileData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // for file upload/multer
        }
      }
    );
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Update profile failed');
  }
}

/**
 * Update own profile by ID
 * PUT /api/auth/:id
 * Supports file upload via FormData
 */
export const updateOwnProfile = async (userId: string, profileData: FormData) => {
  try {
    const response = await axiosInstance.put(
      `/api/auth/${userId}`,
      profileData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Update profile failed');
  }
}

/**
 * Password Reset Functions
 */

/**
 * Request password reset - Send OTP
 * POST /api/v1/donor/forgot-password or /api/v1/organization/forgot-password
 */
export const requestPasswordReset = async (email: string, userType: "donor" | "organization") => {
  try {
    const endpoint = userType === "donor" 
      ? API.AUTH.DONOR.FORGOT_PASSWORD 
      : API.AUTH.ORGANIZATION.FORGOT_PASSWORD;
    
    const response = await axiosInstance.post(endpoint, { email, userType });
    return response.data;
  } catch (error: any) {
    console.error('requestPasswordReset error:', error);
    throw error;
  }
}

/**
 * Verify OTP
 * POST /api/v1/donor/verify-otp or /api/v1/organization/verify-otp
 */
export const verifyOTP = async (email: string, otp: string, userType: "donor" | "organization") => {
  try {
    const endpoint = userType === "donor" 
      ? API.AUTH.DONOR.VERIFY_OTP 
      : API.AUTH.ORGANIZATION.VERIFY_OTP;
    
    const response = await axiosInstance.post(endpoint, { email, otp, userType });
    return response.data;
  } catch (error: any) {
    console.error('verifyOTP error:', error);
    throw error;
  }
}

/**
 * Reset Password
 * POST /api/v1/donor/reset-password or /api/v1/organization/reset-password
 */
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string,
  userType: "donor" | "organization"
) => {
  try {
    const endpoint = userType === "donor" 
      ? API.AUTH.DONOR.RESET_PASSWORD 
      : API.AUTH.ORGANIZATION.RESET_PASSWORD;
    
    const response = await axiosInstance.post(endpoint, {
      email,
      otp,
      newPassword,
      confirmPassword,
      userType,
    });
    return response.data;
  } catch (error: any) {
    console.error('resetPassword error:', error);
    throw error;
  }
}

/**
 * Resend OTP
 * POST /api/v1/donor/resend-otp or /api/v1/organization/resend-otp
 */
export const resendOTP = async (email: string, userType: "donor" | "organization") => {
  try {
    const endpoint = userType === "donor" 
      ? API.AUTH.DONOR.RESEND_OTP 
      : API.AUTH.ORGANIZATION.RESEND_OTP;
    
    const response = await axiosInstance.post(endpoint, { email, userType });
    return response.data;
  } catch (error: any) {
    console.error('resendOTP error:', error);
    throw error;
  }
}
