import axios from 'axios';

// Create centralized axios instance
const apiClient = axios.create({
    // eslint-disable-next-line no-undef
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;