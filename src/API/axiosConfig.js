// src/api/axiosConfig.js

import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Let the browser set the correct multipart boundary when sending FormData
apiClient.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
});

export default apiClient;