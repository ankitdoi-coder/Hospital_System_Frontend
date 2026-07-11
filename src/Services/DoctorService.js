import apiClient from '../API/apiClient';

// 1. Get doctor profile details
export const getDoctorProfile = () => apiClient.get('/api/doctor/profile');

// 2. Get my appointments as a doctor (UPDATED WITH PAGINATION)
export const getMyAppointments = async (page = 0, size = 10) => {
    const response = await apiClient.get('/api/doctor/appointments/my', {
        params: { page, size }
    });
    return response.data; // Yeh ab list ke bajay page object return karega
};

// 3. Update appointment status
export const updateAppointmentStatus = (appointmentId, status) => 
    apiClient.put(`/api/doctor/appointments/${appointmentId}/status`, { status });

// 4. Create prescription for a patient
export const createPrescription = (prescriptionData) => 
    apiClient.post('/api/doctor/prescription', prescriptionData);

// 5. Get all patients for the doctor (Already updated)
export const getMyPatients = async (page = 0, size = 10) => {
    const response = await apiClient.get('/api/doctor/patients', {
        params: { page, size }
    });
    return response.data;
};

// 6. Get all prescriptions created by the doctor
export const getMyPrescriptions = () => apiClient.get('/api/doctor/prescriptions');

// 7. Get prescriptions for an appointment
export const getPrescriptions = (appointmentId) => 
    apiClient.get(`/api/doctor/prescriptions/appointment/${appointmentId}`);

// 8. Notifications Section
export const getMyNotifications = () => apiClient.get('/api/notifications/my');
export const getUnreadCount = () => apiClient.get('/api/notifications/unread-count');
export const markNotificationRead = (id) => apiClient.put(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = () => apiClient.put('/api/notifications/mark-all-read');

// Sabhi functions ko export default object mein bind kar do
const doctorService = {
    getDoctorProfile,
    getMyAppointments,
    updateAppointmentStatus,
    createPrescription,
    getMyPatients,
    getMyPrescriptions,
    getPrescriptions,
    getMyNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead
};

export default doctorService;