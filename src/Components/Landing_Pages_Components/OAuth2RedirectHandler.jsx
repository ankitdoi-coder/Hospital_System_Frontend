import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setAuth } from '../../store/slices/authSlice';
import { saveToken, getDashboardRoute, getUserRole, getUserEmail } from '../../Services/AuthService';
import toast, { Toaster } from 'react-hot-toast';

function OAuth2RedirectHandler() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const getUrlParameter = (name) => {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            const results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        const token = getUrlParameter('token');

        if (token) {
            console.log("Received OAuth2 token:", token);
            
            // Save token to localStorage
            saveToken(token);
            
            // Get user role and email from token
            const userRole = getUserRole();
            const userEmail = getUserEmail();
            
            // Update Redux state
            dispatch(setAuth({
                user: userEmail,
                token: token,
                role: userRole
            }));

            // Get dashboard route based on role
            const dashboardRoute = getDashboardRoute();
            
            // Show success toast
            toast.success('Google Login Successful! Redirecting...', {
                duration: 2000,
                position: 'top-center',
            });

            // Redirect to appropriate dashboard
            setTimeout(() => {
                navigate(dashboardRoute, { replace: true });
            }, 1500);

        } else {
            console.error("OAuth2 redirect error: No token found in URL");
            
            // Show error toast
            toast.error('OAuth2 authentication failed. Please try again.', {
                duration: 3000,
                position: 'top-center',
            });
            
            // Redirect to login page with error
            setTimeout(() => {
                navigate('/login?error=OAuthAuthenticationFailed', { replace: true });
            }, 2000);
        }

    }, [location, navigate, dispatch]);

    return (
        <div className="h-screen w-full flex justify-center items-center bg-gray-100">
            <Toaster />
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing Google login... Please wait.</p>
            </div>
        </div>
    );
}

export default OAuth2RedirectHandler;