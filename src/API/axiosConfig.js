// src/api/axiosConfig.js

import axios from 'axios';

// Create a single, centralized axios instance
const apiClient = axios.create({
    // Get the base URL from the environment variable
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', 
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;