import React, { useState } from 'react';
import Logo from "../assets/OnlyLogo.png";
import BackgroundImage from "../assets/BG4.jpg";
import { Link } from 'react-router-dom';

const Register = () => {
    // ADDED: Centralized state for all form fields
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        role: '',
        specialty: '',
        dob: '',
        contactNumber: '',
        email: '',
        password: '',
    });

    // ADDED: A single handler for all input changes
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    // ADDED: A function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the page from reloading
        // Here you would typically send the data to a server
        console.log("Form data submitted:", formData);
    };


    return (
        <div
            className="min-h-screen w-full bg-cover bg-center flex justify-center items-center p-4"
            style={{ backgroundImage: `url(${BackgroundImage})` }}
        >
            <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg p-8 max-w-md w-full">
                <div className="flex flex-col items-center mb-8">
                    <img src={Logo} alt="Logo" className="w-20 h-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800">Member Registration</h2>
                </div>

                {/* // CHANGED: Added onSubmit handler */}
                <form onSubmit={handleSubmit}>
                    {/* --- COMMON PERSONAL INFO --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500" placeholder="First Name" required />
                        </div>
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500" placeholder="Last Name" required />
                        </div>
                    </div>

                    {/* --- ROLE SELECTION --- */}
                    <div className="relative mb-6">
                        <select id="role" name="role" value={formData.role} onChange={handleChange} className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3" required>
                            <option value="" disabled>Select a role</option>
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                        </select>
                    </div>

                    {/* --- PATIENT-SPECIFIC FIELDS --- */}
                    {formData.role === 'patient' && (
                        <>
                            <div className="relative mb-6">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                                </div>
                                <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500" placeholder="Date of Birth" required />
                            </div>
                            <div className="relative mb-6">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                                </div>
                                <input type="tel" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500" placeholder="Contact Number" required />
                            </div>
                        </>
                    )}

                    {/* --- DOCTOR-SPECIFIC FIELD --- */}
                    {formData.role === 'doctor' && (
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM4 11a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zM4 15a1 1 0 011-1h2a1 1 0 110 2H5a1 1 0 01-1-1z"></path></svg>
                            </div>
                            <input type="text" id="specialty" name="specialty" value={formData.specialty} onChange={handleChange} className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500" placeholder="Specialty (e.g., Cardiology)" required />
                        </div>
                    )}

                    {/* --- COMMON AUTHENTICATION FIELDS --- */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                        </div>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500" placeholder="Email Address" required />
                    </div>
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                        </div>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500" placeholder="Password" required />
                    </div>

                    <button type="submit" className="w-full text-blac bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-md px-5 py-3 text-center transition duration-300">
                        REGISTER
                    </button>

                    <p className="text-sm font-medium text-center text-gray-700 mt-6">
                        Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-bold">Login Here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;