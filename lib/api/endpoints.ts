

export const API = {
    AUTH: {
      
        DONOR: {
            LOGIN: '/api/v1/donor/login',
            REGISTER: '/api/v1/donor/register',
            FORGOT_PASSWORD: '/api/v1/donor/forgot-password',
            VERIFY_OTP: '/api/v1/donor/verify-otp',
            RESET_PASSWORD: '/api/v1/donor/reset-password',
            RESEND_OTP: '/api/v1/donor/resend-otp',
        },
        ORGANIZATION: {
            LOGIN: '/api/v1/organization/login',
            REGISTER: '/api/v1/organization/register',
            FORGOT_PASSWORD: '/api/v1/organization/forgot-password',
            VERIFY_OTP: '/api/v1/organization/verify-otp',
            RESET_PASSWORD: '/api/v1/organization/reset-password',
            RESEND_OTP: '/api/v1/organization/resend-otp',
        },
        ADMIN: {
            LOGIN: '/api/v1/admin/login',
            REGISTER: '/api/v1/admin/register',
        },
        WHOAMI: '/api/v1/auth/whoami',
        UPDATEPROFILE: '/api/v1/auth/update-profile',
    },
    ADMIN: {
        USER: {
            CREATE: '/api/v1/admin/users',
            GET_ALL: '/api/v1/admin/users',
            GET_ONE: '/api/v1/admin/users',
            UPDATE: '/api/v1/admin/users',
            DELETE: '/api/v1/admin/users',
        },
        CAMPAIGN: {
            CREATE: '/api/v1/admin/campaigns',
            GET_ALL: '/api/v1/admin/campaigns',
            GET_ONE: '/api/v1/admin/campaigns',
            UPDATE: '/api/v1/admin/campaigns',
            DELETE: '/api/v1/admin/campaigns',
        },
        PROFILE: {
            ME: '/api/v1/admin/me',
            CHANGE_PASSWORD: '/api/v1/admin/change-password',
        },
        STATS: {
            DASHBOARD: '/api/v1/admin/stats/dashboard',
        }
    },
    CAMPAIGNS: {
        GET_MY: '/api/v1/campaigns/my-campaigns',
        CREATE: '/api/v1/campaigns',
        GET_ONE: '/api/v1/campaigns',
        UPDATE: '/api/v1/campaigns',
        DELETE: '/api/v1/campaigns',
        GET_PARTICIPANTS: '/api/v1/campaigns',
        GET_ALL: '/api/v1/campaigns',
        GET_MY_APPLIED: '/api/v1/campaigns/my-applied',
        APPLY: '/api/v1/campaigns',
    },
    BLOOD_REQUESTS: {
        GET_MY: '/api/v1/requests/my-requests',
        CREATE: '/api/v1/requests',
        GET_ONE: '/api/v1/requests',
        UPDATE: '/api/v1/requests',
        DELETE: '/api/v1/requests',
        GET_APPLICANTS: '/api/v1/requests',
        GET_ALL: '/api/v1/requests',
        GET_MY_ACCEPTED: '/api/v1/requests/my-accepted',
        ACCEPT: '/api/v1/requests',
    },
    INVENTORY: {
        GET_MY: '/api/v1/inventory',
        GET_ALL: '/api/v1/inventory/all-stock',
        UPDATE: '/api/v1/inventory/update',
        DELETE: '/api/v1/inventory',
    },
    DONATIONS: {
        GET_HISTORY: '/api/v1/donations/history',
        REGISTER_WALKIN: '/api/v1/donations/walkin',
        REGISTER_DONATION: '/api/v1/donations/register',
    },
    PROFILE: {
        DONOR: {
            UPDATE: '/api/v1/donor',
            UPLOAD_PHOTO: '/api/v1/donor/upload-photo',
        },
        ORGANIZATION: {
            UPDATE: '/api/v1/organization',
            UPLOAD_PHOTO: '/api/v1/organization/upload-photo',
        },
    },
    ORGANIZATION: {
        DASHBOARD_STATS: '/api/v1/organization/dashboard/stats',
    },
    NOTIFICATIONS: {
        GET_ALL: '/api/v1/notifications',
    }
}
