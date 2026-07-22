import apiClient from '../API/apiClient';

export const askChatbot = async (message) => {
    const response = await apiClient.post('/api/patient/chatbot/ask', { message });
    return response.data; // { reply: "..." }
};