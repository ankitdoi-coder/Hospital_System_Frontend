import { Navigate } from 'react-router-dom';
import { getToken } from "../../Services/AuthService.js";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = getToken();
    const userRole = userRole();

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If roles are specified and user doesn't have the required role
    if (allowedRoles && allowedRoles.length > 0) {
        const hasRole = allowedRoles.some(role =>
            userRole && userRole.includes(role)
        );

        if (!hasRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;