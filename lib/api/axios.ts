import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        
        // Add auth token to headers if it exists
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // If data is FormData, remove Content-Type header to let browser set it
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response received:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('Response error:', {
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data
        });
        
        // Return a more descriptive error
        if (error.response) {
            // Server responded with error status
            return Promise.reject({
                success: false,
                message: error.response.data?.message || `Request failed with status code ${error.response.status}`,
                statusCode: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            // Request was made but no response received
            return Promise.reject({
                success: false,
                message: 'No response from server. Please check your network connection.',
            });
        } else {
            // Something else happened
            return Promise.reject({
                success: false,
                message: error.message || 'An unexpected error occurred',
            });
        }
    }
);

export default axiosInstance;