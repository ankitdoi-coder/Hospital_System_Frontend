import axios from 'axios';
import { getToken } from './AuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const FILE_API_URL = import.meta.env.VITE_FILE_API_URL || 'http://localhost:8080';

// Create axios instance with auth header
const createAuthenticatedRequest = () => {
    const token = getToken();
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    };
};

// Upload profile picture
export const uploadProfilePicture = async (file, userType = 'patient') => {
    try {
        const formData = new FormData();
        formData.append('profilePicture', file);
        
        const config = createAuthenticatedRequest();
        const endpoint = userType === 'doctor' ? '/doctor/profile/picture' : '/patient/profile/picture';
        
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, config);
        
        // Construct full image URL if response contains just the path
        if (response.data.imageUrl) {
            const imageUrl = response.data.imageUrl;
            if (imageUrl.startsWith('/')) {
                response.data.imageUrl = `${FILE_API_URL}${imageUrl}`;
            }
        }
        
        return response.data;
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        throw error;
    }
};

// Get profile picture URL
export const getProfilePictureUrl = async (userType = 'patient') => {
    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        };
        
        const endpoint = userType === 'doctor' ? '/doctor/profile/picture' : '/patient/profile/picture';
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, config);
        
        // Construct full URL if response contains just the path
        let imageUrl = response.data;
        if (typeof imageUrl === 'string' && imageUrl.startsWith('/')) {
            imageUrl = `${FILE_API_URL}${imageUrl}`;
        }
        
        return imageUrl;
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        return null;
    }
};

// Delete profile picture
export const deleteProfilePicture = async (userType = 'patient') => {
    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        };
        
        const endpoint = userType === 'doctor' ? '/doctor/profile/picture' : '/patient/profile/picture';
        const response = await axios.delete(`${API_BASE_URL}${endpoint}`, config);
        return response.data;
    } catch (error) {
        console.error('Error deleting profile picture:', error);
        throw error;
    }
};

// Local storage helpers for offline caching
export const saveProfilePictureToLocal = (imageUrl, userType = 'patient') => {
    const key = `profilePicture_${userType}`;
    localStorage.setItem(key, imageUrl);
};

export const getProfilePictureFromLocal = (userType = 'patient') => {
    const key = `profilePicture_${userType}`;
    return localStorage.getItem(key);
};

export const removeProfilePictureFromLocal = (userType = 'patient') => {
    const key = `profilePicture_${userType}`;
    localStorage.removeItem(key);
};