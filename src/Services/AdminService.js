import apiClient from '../API/apiClient';

// 1. Get all doctors (UPDATED WITH PAGINATION)
export const getDoctors = async (page = 0, size = 10) => {
    const response = await apiClient.get('/api/admin/doctors', {
        params: { page, size }
    });
    return response.data;
};
export const getEnquries = async (page = 0, size = 10) => {
    const response = await apiClient.get('/api/admin/enquries', {
        params: { page, size }
    });
    return response.data;
};

// Approve doctor (No pagination needed)
export const approveDoctor = (id) => apiClient.put(`/api/admin/doctors/${id}/approve`);

// Reject doctor (No pagination needed)
export const rejectDoctor = (id) => apiClient.put(`/api/admin/doctors/${id}/reject`);

// 2. Get all patients (UPDATED WITH PAGINATION)
export const getPatients = async (page = 0, size = 10) => {
    const response = await apiClient.get('/api/admin/patients', {
        params: { page, size }
    });
    return response.data;
};

// 3. Get all billing records (UPDATED WITH PAGINATION)
export const getBilling = async (page = 0, size = 10) => {
    const response = await apiClient.get('/api/admin/billing', {
        params: { page, size }
    });
    return response.data;
};

// Update billing status (No pagination needed)
export const updateBillingStatus = (id, status) => apiClient.put(`/api/admin/billing/${id}/status`, status);

// Get revenue stats (No pagination needed, returns a single number)
export const getDailyRevenue = () => apiClient.get('/api/admin/revenue/daily');
export const getMonthlyRevenue = () => apiClient.get('/api/admin/revenue/monthly');

const adminService = {
    getDoctors,
    approveDoctor,
    rejectDoctor,
    getPatients,
    getBilling,
    updateBillingStatus,
    getDailyRevenue,
    getMonthlyRevenue
};

export default adminService;