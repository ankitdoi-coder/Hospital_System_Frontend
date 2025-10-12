import axios from "axios";

// REST API Base URL for Authentication
const REST_API_BASE_URL = 'http://localhost:8080/api/auth';

// ==================== API CALLS ====================

// For Registering the user
export const RegisterUser = (registerData) => 
    axios.post(`${REST_API_BASE_URL}/register`, registerData);

// For Logging in the user
export const LoginUser = (loginData) => 
    axios.post(`${REST_API_BASE_URL}/login`, loginData);

// ==================== TOKEN MANAGEMENT ====================

// Save JWT token to localStorage
export const saveToken = (token) => {
    localStorage.setItem('jwtToken', token);
};

// Get JWT token from localStorage
export const getToken = () => {
    return localStorage.getItem('jwtToken');
};

// Remove JWT token from localStorage (for logout)
export const removeToken = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;
    
    try {
        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // Convert to milliseconds
        return Date.now() < expiry;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        return false;
    }
};

// ==================== USER ROLE MANAGEMENT ====================

// Decode JWT and get user role
export const getUserRole = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Handle different JWT structures
        // Your backend might use 'authorities', 'roles', or 'role'
        const authorities = payload.authorities || payload.roles || payload.role;
        
        if (Array.isArray(authorities)) {
            return authorities[0]; // Return first role
        } else if (typeof authorities === 'string') {
            return authorities;
        }
        
        return null;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// Get user email from JWT
export const getUserEmail = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.email || payload.username;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// Check if user has specific role
export const hasRole = (role) => {
    const userRole = getUserRole();
    if (!userRole) return false;
    return userRole.includes(role);
};

// ==================== AXIOS INTERCEPTORS ====================


// Setup axios to automatically include JWT token in all requests
export const setupAxiosInterceptors = () => {
    // Request interceptor - Add token to headers
    axios.interceptors.request.use(
        (config) => {
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor - Handle 401 errors (expired token)
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response && error.response.status === 401) {
                // Token expired or invalid
                removeToken();
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

// ==================== NAVIGATION HELPERS ====================

// Get dashboard URL based on user role
export const getDashboardRoute = () => {
    const role = getUserRole();
    
    if (!role) return '/login';
    
    if (role.includes('ROLE_PATIENT') || role.includes('PATIENT')) {
        return '/patient/dashboard';
    } else if (role.includes('ROLE_DOCTOR') || role.includes('DOCTOR')) {
        return '/doctor/dashboard';
    } else if (role.includes('ROLE_ADMIN') || role.includes('ADMIN')) {
        return '/admin/dashboard';
    }
    
    return '/dashboard'; // Default
};

// ==================== USER INFO ====================

// Get complete user info from token
export const getUserInfo = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            email: payload.sub || payload.email || payload.username,
            role: getUserRole(),
            exp: payload.exp,
            iat: payload.iat
        };
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};