import { LoginSchemaType, RegisterSchemaType } from "@/app/(auth)/schema"
import axios from "./axios"
import { API } from "./endpoints"


export const registerDonor = async (registerData: RegisterSchemaType) => {
    try {
        const response = await axios.post(API.AUTH.DONOR.REGISTER, registerData)
        return response.data
    } catch (error: any) {
        console.error('registerDonor error:', error);
        throw error;
    }
}

export const registerOrganization = async (registerData: RegisterSchemaType) => {
    try {
        const response = await axios.post(API.AUTH.ORGANIZATION.REGISTER, registerData)
        return response.data
    } catch (error: any) {
        console.error('registerOrganization error:', error);
        throw error;
    }
}

export const loginDonor = async (loginData: LoginSchemaType) => {
    try {
        const response = await axios.post(API.AUTH.DONOR.LOGIN, loginData)
        return response.data
    } catch (error: any) {
        console.error('loginDonor error:', error);
        throw error;
    }
}

export const loginOrganization = async (loginData: LoginSchemaType) => {
    try {
        const response = await axios.post(API.AUTH.ORGANIZATION.LOGIN, loginData)
        return response.data
    } catch (error: any) {
        console.error('loginOrganization error:', error);
        throw error;
    }
}