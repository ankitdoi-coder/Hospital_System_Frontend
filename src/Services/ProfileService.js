import api from '../API/apiClient';

const API_URL = '/api/profile';

const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post(`${API_URL}/upload-image`, formData);

    return response?.data?.imageUrl || response?.data?.url || null;
};

const deletePatientProfilePicture = async () => {
    await api.delete(`${API_URL}/delete-image`);
};

const saveProfilePictureToLocal = (imageUrl, userType = 'patient') => {
    if (!imageUrl) return;
    localStorage.setItem(`profilePicture_${userType}`, imageUrl);
};

const getProfilePictureFromLocal = (userType = 'patient') => {
    return localStorage.getItem(`profilePicture_${userType}`);
};

const ProfileService = {
    uploadProfilePicture,
    deletePatientProfilePicture,
    saveProfilePictureToLocal,
    getProfilePictureFromLocal,
};

export {
    uploadProfilePicture,
    deletePatientProfilePicture,
    saveProfilePictureToLocal,
    getProfilePictureFromLocal,
};

export default ProfileService;