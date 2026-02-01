

export const API = {
    AUTH: {
      
        DONOR: {
            LOGIN: '/api/v1/donorusers/login',
            REGISTER: '/api/v1/donorusers/register',
        },
        ORGANIZATION: {
            LOGIN: '/api/v1/organizations/login',
            REGISTER: '/api/v1/organizations/register',
        },
        ADMIN: {
            LOGIN: '/api/admin/users/login',
            REGISTER: '/api/admin/users/register',
        },
        WHOAMI: '/api/auth/whoami',
        UPDATEPROFILE: '/api/auth/update-profile',
    },
    ADMIN: {
        USER: {
            CREATE: '/api/admin/users',
            GET_ALL: '/api/admin/users',
            GET_ONE: '/api/admin/users',
            UPDATE: '/api/admin/users',
            DELETE: '/api/admin/users',
        }
    }
}
