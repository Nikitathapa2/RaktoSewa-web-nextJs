import { API } from "./endpoints";
import axiosInstance from "./axios";

/**
 * Create a new blood request (Organization only)
 * POST /api/v1/requests
 */
export const createBloodRequest = async (requestData: {
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  urgency: 'NORMAL' | 'CRITICAL';
  location: string;
  contactNumber: string;
}) => {
  try {
    const response = await axiosInstance.post(
      API.BLOOD_REQUESTS.CREATE,
      requestData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Create blood request failed');
  }
}

/**
 * Get all blood requests created by the logged-in organization
 * GET /api/v1/requests/my-requests?page=1&limit=10
 */
export const getMyBloodRequests = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await axiosInstance.get(API.BLOOD_REQUESTS.GET_MY, {
      params: { page, limit }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to fetch blood requests');
  }
}

/**
 * Get a single blood request by ID
 * GET /api/v1/requests/:id
 */
export const getBloodRequestById = async (requestId: string) => {
  try {
    const response = await axiosInstance.get(`${API.BLOOD_REQUESTS.GET_ONE}/${requestId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to fetch blood request');
  }
}

/**
 * Update a blood request (Organization only)
 * PUT /api/v1/requests/:id
 */
export const updateBloodRequest = async (requestId: string, updateData: {
  patientName?: string;
  bloodGroup?: string;
  unitsRequired?: number;
  urgency?: 'NORMAL' | 'CRITICAL';
  location?: string;
  contactNumber?: string;
  status?: 'PENDING' | 'FULFILLED' | 'CANCELLED';
}) => {
  try {
    const response = await axiosInstance.put(
      `${API.BLOOD_REQUESTS.UPDATE}/${requestId}`,
      updateData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to update blood request');
  }
}

/**
 * Delete a blood request (Organization only)
 * DELETE /api/v1/requests/:id
 */
export const deleteBloodRequest = async (requestId: string) => {
  try {
    const response = await axiosInstance.delete(`${API.BLOOD_REQUESTS.DELETE}/${requestId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to delete blood request');
  }
}

/**
 * Get applicants/donors who accepted a blood request
 * GET /api/v1/requests/:id/applicants?page=1&limit=10
 */
export const getBloodRequestApplicants = async (requestId: string, page: number = 1, limit: number = 10) => {
  try {
    const response = await axiosInstance.get(`${API.BLOOD_REQUESTS.GET_APPLICANTS}/${requestId}/applicants`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to fetch applicants');
  }
}

/**
 * Accept/submit a donation for a blood request (Donor only)
 * POST /api/v1/requests/:id/accept
 */
export const acceptBloodRequest = async (requestId: string) => {
  try {
    const response = await axiosInstance.post(`${API.BLOOD_REQUESTS.GET_ONE}/${requestId}/accept`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to submit donation');
  }
}

/**
 * Get all blood requests (Donor - to see available requests)
 * GET /api/v1/requests?page=1&limit=10
 */
export const getAllBloodRequests = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await axiosInstance.get(API.BLOOD_REQUESTS.GET_ALL, {
      params: { page, limit }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to fetch blood requests');
  }
}

/**
 * Get blood requests the donor has accepted (Donor only)
 * GET /api/v1/requests/my-accepted?page=1&limit=10
 */
export const getMyAcceptedBloodRequests = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await axiosInstance.get(API.BLOOD_REQUESTS.GET_MY_ACCEPTED, {
      params: { page, limit }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to fetch accepted blood requests');
  }
}

/**
 * Remove an applicant from a blood request (Organization only)
 * DELETE /api/v1/requests/:id/applicants/:applicantId
 */
export const removeApplicantFromRequest = async (requestId: string, applicantId: string) => {
  try {
    const response = await axiosInstance.delete(`${API.BLOOD_REQUESTS.GET_APPLICANTS}/${requestId}/applicants/${applicantId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message
      || error.message || 'Failed to remove applicant from request');
  }
}
