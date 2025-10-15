// src/api/axiosConfig.js

import axios from 'axios';

// Create a single, centralized axios instance
const apiClient = axios.create({
    // Get the base URL from the environment variable
    // eslint-disable-next-line no-undef
    baseURL: process.env.REACT_APP_API_BASE_URL, 
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;