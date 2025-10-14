import { axiosInstance } from './AuthService';

const REST_API_BASE_URL = '/api/doctor';

// Get my appointments as a doctor
export const getMyAppointments = () => axiosInstance.get(`${REST_API_BASE_URL}/appointments/my`);

// Update appointment status
export const updateAppointmentStatus = (appointmentId, status) => 
    axiosInstance.put(`${REST_API_BASE_URL}/appointments/${appointmentId}/status`, { status });

// Create prescription for a patient
export const createPrescription = (prescriptionData) => 
    axiosInstance.post(`${REST_API_BASE_URL}/prescription`, prescriptionData);

// Get all patients for the doctor
export const getMyPatients = () => axiosInstance.get(`${REST_API_BASE_URL}/patients`);

// Get all prescriptions created by the doctor
export const getMyPrescriptions = () => axiosInstance.get(`${REST_API_BASE_URL}/prescriptions`);

// Get prescriptions for an appointment (if needed later)
export const getPrescriptions = (appointmentId) => 
    axiosInstance.get(`${REST_API_BASE_URL}/prescriptions/appointment/${appointmentId}`);