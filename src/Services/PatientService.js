import { axiosInstance } from './AuthService';

const REST_API_BASE_URL = '/api/patient';

// Get all approved doctors
export const getDoctors = () => axiosInstance.get(`${REST_API_BASE_URL}/doctors`);

// Book new appointment
export const bookAppointment = (appointmentData) => axiosInstance.post(`${REST_API_BASE_URL}/appointments/new`, appointmentData);

// Get my appointments
export const getMyAppointments = () => axiosInstance.get(`${REST_API_BASE_URL}/appointments/my`);

// Get my prescriptions
export const getMyPrescriptions = () => axiosInstance.get(`${REST_API_BASE_URL}/prescriptions`);

// Get my profile
export const getMyProfile = () => axiosInstance.get(`${REST_API_BASE_URL}/profile`);

// Make payment
export const makePayment = (appointmentId) => axiosInstance.put(`${REST_API_BASE_URL}/appointments/${appointmentId}/pay`);

// Cancel appointment
export const cancelAppointment = (appointmentId) => axiosInstance.delete(`${REST_API_BASE_URL}/appointments/${appointmentId}/cancel`);