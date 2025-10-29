import { axiosInstance } from './AuthService';

const REST_API_BASE_URL = '/api/admin';

// Get all doctors
export const getDoctors = () => axiosInstance.get(`${REST_API_BASE_URL}/doctors`);

// Approve doctor
export const approveDoctor = (id) => axiosInstance.put(`${REST_API_BASE_URL}/doctors/${id}/approve`);

// Reject doctor
export const rejectDoctor = (id) => axiosInstance.put(`${REST_API_BASE_URL}/doctors/${id}/reject`);

// Get all patients
export const getPatients = () => axiosInstance.get(`${REST_API_BASE_URL}/patients`);

// Get all billing records
export const getBilling = () => axiosInstance.get(`${REST_API_BASE_URL}/billing`);

// Update billing status
export const updateBillingStatus = (id, status) => axiosInstance.put(`${REST_API_BASE_URL}/billing/${id}/status`, status);

// Get revenue stats
export const getDailyRevenue = () => axiosInstance.get(`${REST_API_BASE_URL}/revenue/daily`);
export const getMonthlyRevenue = () => axiosInstance.get(`${REST_API_BASE_URL}/revenue/monthly`);
