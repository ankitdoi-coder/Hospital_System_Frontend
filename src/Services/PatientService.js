import apiClient from '../API/apiClient';

// 1. Get all approved doctors (PAGINATED)
export const getDoctors = async (page = 0, size = 10) => {
    const response = await apiClient.get('/api/patient/doctors', {
        params: { page, size }
    });
    return response.data; // { content, totalElements, totalPages, ... }
};

// 2. Book new appointment (No pagination needed)
export const bookAppointment = (appointmentData) =>
    apiClient.post('/api/patient/appointments/new', appointmentData);

// 3. Get my appointments (PAGINATED)
export const getMyAppointments = async (page = 0, size = 10) => {
    const response = await apiClient.get('/api/patient/appointments/my', {
        params: { page, size }
    });
    return response.data; // { content, totalElements, totalPages, ... }
};

// 4. Get my prescriptions (PAGINATED)
export const getMyPrescriptions = async (page = 0, size = 10) => {
    const response = await apiClient.get('/api/patient/prescriptions', {
        params: { page, size }
    });
    return response.data; // { content, totalElements, totalPages, ... }
};

// 5. Get my profile (No pagination needed)
// FIX: was returning the raw axios response ({ data, status, headers... }).
// Now unwraps .data like every other method in this file, so callers
// don't have to remember "profile is special, do .data.data".
export const getMyProfile = async () => {
    const response = await apiClient.get('/api/patient/profile');
    return response.data; // the profile object itself
};

// 6. Payments
export const makePayment = (appointmentId) => apiClient.put(`/api/patient/appointments/${appointmentId}/pay`);
export const createRazorpayOrder = (appointmentId, amount, currency = 'INR') =>
    apiClient.post('/api/payments/create-order', { appointmentId, amount, currency });
export const verifyRazorpayPayment = (payload) => apiClient.post('/api/payments/verify', payload);

// 7. Cancel appointment (No pagination needed)
export const cancelAppointment = (appointmentId) => apiClient.delete(`/api/patient/appointments/${appointmentId}/cancel`);

// 8. Notifications (No pagination needed)
export const getMyNotifications = () => apiClient.get('/api/notifications/my');
export const getUnreadCount = () => apiClient.get('/api/notifications/unread-count');
export const markNotificationRead = (id) => apiClient.put(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = () => apiClient.put('/api/notifications/mark-all-read');

// EXPORT OBJECT FOR DEFAULT IMPORT
const patientService = {
    getDoctors,
    bookAppointment,
    getMyAppointments,
    getMyPrescriptions,
    getMyProfile,
    makePayment,
    createRazorpayOrder,
    verifyRazorpayPayment,
    cancelAppointment,
    getMyNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead
};

export default patientService;