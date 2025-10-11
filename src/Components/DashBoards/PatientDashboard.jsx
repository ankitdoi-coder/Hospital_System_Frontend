import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken, getUserEmail } from "../../Services/AuthService.js";

const PatientDashboard = () => {
    const navigate = useNavigate();
    const userEmail = getUserEmail();

    const handleLogout = () => {
        removeToken();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-blue-600 text-white p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Patient Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm">Welcome, {userEmail}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">My Appointments</h3>
                        <p className="text-gray-600">View your upcoming appointments</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Medical Records</h3>
                        <p className="text-gray-600">Access your medical history</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Book Appointment</h3>
                        <p className="text-gray-600">Schedule a new appointment</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientDashboard;