import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupAxiosInterceptors, getToken, isAuthenticated } from './Services/AuthService.js'

// Setup axios interceptors BEFORE rendering
setupAxiosInterceptors();

// Debug: Check if user has valid token on page load
const token = getToken();
if (token) {
    console.log('📋 Token found in localStorage on page load');
    const isValid = isAuthenticated();
    console.log('🔐 Token valid:', isValid);
    if (!isValid) {
        console.warn('⚠️ Token expired - user will need to login again');
    }
} else {
    console.log('ℹ️ No token found - user needs to login');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
