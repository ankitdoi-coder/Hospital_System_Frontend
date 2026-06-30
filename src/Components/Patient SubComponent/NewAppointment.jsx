import React, { useState, useEffect } from 'react';
import { getDoctors, bookAppointment } from '../../Services/PatientService.js';
import { setupAxiosInterceptors } from '../../Services/AuthService.js';

const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

const NewAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [doctorsLoading, setDoctorsLoading] = useState(true);

    useEffect(() => {
        setupAxiosInterceptors();
        const fetchDoctors = async () => {
            try {
                const response = await getDoctors();
                setDoctors(response.data);
            } catch (error) {
                console.error('Failed to fetch doctors:', error);
            } finally {
                setDoctorsLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const selectedDoctorObj = doctors.find(d => String(d.id) === String(selectedDoctor));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const appointmentDateTime = appointmentDate && appointmentTime
                ? `${appointmentDate}T${appointmentTime}`
                : appointmentDate;

            const appointmentData = {
                doctorId: parseInt(selectedDoctor),
                appointmentDate: appointmentDateTime
            };

            await bookAppointment(appointmentData);

            setSelectedDoctor('');
            setAppointmentDate('');
            setAppointmentTime('');
            setReason('');

            alert('Appointment booked successfully!');
        } catch (error) {
            console.error('Failed to book appointment:', error);
            alert('Failed to book appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Book New Appointment</span>
                </h2>
                <p className="text-purple-100 mt-2">Schedule a visit with one of our specialists</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-7">
                    {/* Doctor Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Doctor
                        </label>
                        <div className="relative">
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                required
                                disabled={doctorsLoading}
                                className="w-full appearance-none border border-gray-200 bg-gray-50 rounded-xl pl-4 pr-10 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-60 transition-all"
                            >
                                <option value="">
                                    {doctorsLoading ? 'Loading doctors…' : 'Choose a doctor...'}
                                </option>
                                {doctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>
                                        Dr. {doctor.firstName} {doctor.lastName} — {doctor.specialty}
                                    </option>
                                ))}
                            </select>
                            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {selectedDoctorObj && (
                            <div className="mt-3 flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        Dr. {selectedDoctorObj.firstName} {selectedDoctorObj.lastName}
                                    </p>
                                    <p className="text-xs text-purple-700 font-medium">{selectedDoctorObj.specialty}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Date + Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Appointment Date
                            </label>
                            <input
                                type="date"
                                value={appointmentDate}
                                onChange={(e) => setAppointmentDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Appointment Time
                            </label>
                            <div className="relative">
                                <select
                                    value={appointmentTime}
                                    onChange={(e) => setAppointmentTime(e.target.value)}
                                    required
                                    className="w-full appearance-none border border-gray-200 bg-gray-50 rounded-xl pl-4 pr-10 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select time...</option>
                                    {TIME_SLOTS.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Reason for Visit <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            placeholder="Describe your symptoms or reason for the appointment..."
                            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-xl shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Booking...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Book Appointment
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewAppointment;