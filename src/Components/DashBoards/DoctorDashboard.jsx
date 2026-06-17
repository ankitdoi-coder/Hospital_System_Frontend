import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setAppointments, setLoading, updateAppointment, setPatients } from '../../store/slices/appointmentsSlice';
import { setPrescriptions, addPrescription } from '../../store/slices/prescriptionsSlice';
import { selectCompletedAppointments, selectPendingAppointments, selectScheduledAppointments, selectTodayAppointments } from '../../store/selectors';

import { removeToken, getUserEmail, setupAxiosInterceptors } from "../../Services/AuthService.js";
// eslint-disable-next-line no-unused-vars
import { getMyAppointments, updateAppointmentStatus, createPrescription, getMyPatients, getMyPrescriptions } from "../../Services/DoctorService.js";
import { getProfilePictureFromLocal } from "../../Services/ProfileService.js";
import ProfileSettings from "../ProfileSettings.jsx";
import logo from "../../assets/OnlyLogo.svg"
import totalPatient from  "../../assets/totalPatient.svg"
import scheduled from "../../assets/scheduled.svg"
import completed from "../../assets/completed.svg"
import pending from "../../assets/pending.svg"
import today from "../../assets/today.svg"

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const userEmail = getUserEmail();
    
    const { list: appointments, loading, patients } = useAppSelector(state => state.appointments);
    const { list: prescriptions } = useAppSelector(state => state.prescriptions);
    
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [prescriptionData, setPrescriptionData] = useState({ medicationDetails: '', dosages: '' });
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [activeView, setActiveView] = useState('dashboard');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPrescription, setEditingPrescription] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setupAxiosInterceptors();
        fetchAppointments();
        fetchPrescriptions();
    }, []);
    
    useEffect(() => {
        if (appointments.length > 0) {
            fetchPatients();
        }
    }, [appointments]);

    const fetchPatients = async () => {
        try {
            console.log('Fetching patients...');
            const response = await getMyPatients();
            console.log('Patients response:', response.data);
            dispatch(setPatients(response.data || []));
        } catch (error) {
            console.error('Error fetching patients:', error);
            // Fallback to extracting from appointments if API fails
            const completedAppts = appointments.filter(apt => apt.status === 'COMPLETED');
            const uniquePatients = [];
            const seenPatientIds = new Set();
            
            completedAppts.forEach(apt => {
                if (!seenPatientIds.has(apt.patientId)) {
                    seenPatientIds.add(apt.patientId);
                    uniquePatients.push({
                        id: apt.patientId,
                        firstName: apt.patientFirstName || 'Patient',
                        lastName: apt.patientLastName || `#${apt.patientId}`,
                        appointmentDate: apt.appointmentDate,
                        appointmentCount: completedAppts.filter(a => a.patientId === apt.patientId).length
                    });
                }
            });
            dispatch(setPatients(uniquePatients));
        }
    };

    const fetchPrescriptions = async () => {
        try {
            console.log('Fetching prescriptions...');
            const response = await getMyPrescriptions();
            console.log('Prescriptions response:', response.data);
            dispatch(setPrescriptions(response.data || []));
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            dispatch(setPrescriptions([]));
        }
    };

    const filteredPatients = patients.filter(patient => 
        patient && (
            ((patient.firstName || '') + ' ' + (patient.lastName || '')).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const filteredPrescriptions = prescriptions.filter(prescription => 
        prescription && (
            ((prescription.patientFirstName || '') + ' ' + (prescription.patientLastName || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (prescription.medicationDetails || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const fetchAppointments = async () => {
        try {
            dispatch(setLoading(true));
            const response = await getMyAppointments();
            dispatch(setAppointments(response.data));
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            const response = await updateAppointmentStatus(appointmentId, newStatus);
            dispatch(updateAppointment(response.data));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleCreatePrescription = async () => {
        try {
            const prescription = {
                appointmentId: selectedAppointment.id,
                medicationDetails: prescriptionData.medicationDetails,
                dosages: prescriptionData.dosages
            };
            const response = await createPrescription(prescription);
            dispatch(addPrescription(response.data));
            setShowPrescriptionModal(false);
            setPrescriptionData({ medicationDetails: '', dosages: '' });
            alert('Prescription created successfully!');
        } catch (error) {
            console.error('Error creating prescription:', error);
            alert('Failed to create prescription');
        }
    };
    
    const handleEditPrescription = (prescription) => {
        setEditingPrescription(prescription);
        setPrescriptionData({
            medicationDetails: prescription.medicationDetails,
            dosages: prescription.dosages
        });
        setShowEditModal(true);
    };
    
    const handleUpdatePrescription = async () => {
        try {
            alert('Prescription updated successfully!');
            setShowEditModal(false);
            setEditingPrescription(null);
            setPrescriptionData({ medicationDetails: '', dosages: '' });
            fetchPrescriptions();
        } catch (error) {
            console.error('Error updating prescription:', error);
            alert('Failed to update prescription');
        }
    };
    
    const handlePrintPrescription = (prescription) => {
        const printContent = `
            PRESCRIPTION
            ============
            Patient: ${prescription.patientFirstName} ${prescription.patientLastName}
            Date: ${new Date(prescription.createdAt).toLocaleDateString()}
            
            Medication: ${prescription.medicationDetails}
            Dosage: ${prescription.dosages}
            
            Doctor: Dr. ${userEmail}
        `;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>Prescription</title></head>
                <body style="font-family: Arial; padding: 20px;">
                    <pre>${printContent}</pre>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleLogout = () => {
        removeToken();
        navigate('/login');
    };

    const completedAppointments = useAppSelector(selectCompletedAppointments).length;
    const pendingAppointments = useAppSelector(selectPendingAppointments).length;
    const scheduledAppointments = useAppSelector(selectScheduledAppointments).length;
    const todayAppointments = useAppSelector(selectTodayAppointments).length;

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const getAppointmentsForDate = (date) => appointments.filter(apt => 
        new Date(apt.appointmentDate).toDateString() === date.toDateString()
    );

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayAppointments = getAppointmentsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            days.push(
                <div key={day} className={`h-10 bg-amber-50 text-xs flex items-center justify-center relative ${
                    isToday ? 'bg-blue-600 text-white rounded' : 'text-gray-600 border-b-blue-500 hover:text-orange-800'
                }`}>
                    {day}
                    {dayAppointments.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                </div>
            );
        }
        return days;
    };

    const NAV_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', icon: <svg width={17} height={17} fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg> },
        { id: 'appointments', label: 'Appointments', icon: <svg width={17} height={17} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg> },
        { id: 'patients', label: 'Patients', icon: <svg width={17} height={17} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> },
        { id: 'prescriptions', label: 'Prescriptions', icon: <svg width={17} height={17} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM3.293 7.707A1 1 0 014 7h12a1 1 0 01.707.293l2 2a1 1 0 010 1.414l-2 2A1 1 0 0116 13H4a1 1 0 01-.707-.293l-2-2a1 1 0 010-1.414l2-2z" clipRule="evenodd" /></svg> },
        { id: 'profile', label: 'Profile Settings', icon: <svg width={17} height={17} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    ];

    return (
        <>
            <style>{`
                .doc-shell { display:flex; height:100vh; overflow:hidden; background:#F9FAFB; font-family:'Inter','Segoe UI',system-ui,sans-serif; }
                /* ── Sidebar ── */
                .doc-sidebar {
                    width: 240px;
                    flex-shrink: 0;
                    background: #fff;
                    border-right: 1px solid #E5E7EB;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    z-index: 50;
                    transition: transform 0.25s ease;
                }
                /* Nav buttons */
                .doc-nav {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    width: 100%;
                    padding: 10px 12px;
                    margin-bottom: 3px;
                    border: none;
                    border-radius: 8px;
                    border-left: 3px solid transparent;
                    background: transparent !important;
                    color: #4B5563;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    text-align: left;
                    transition: color 0.15s ease;
                }
                .doc-nav:hover { background: transparent !important; }
                .doc-nav.active {
                    background: #EFF6FF !important;
                    color: #2563EB !important;
                    font-weight: 600;
                    border-left-color: #2563EB !important;
                }
                /* Hamburger hidden on desktop */
                .doc-hamburger { display: none !important; }
                /* Overlay hidden on desktop */
                .doc-overlay { display: none; }
                /* Mobile */
                @media (max-width: 767px) {
                    .doc-sidebar {
                        position: fixed;
                        top: 0; left: 0; bottom: 0;
                        transform: translateX(-100%);
                        background: #fff;
                    }
                    .doc-sidebar.open {
                        transform: translateX(0);
                        box-shadow: 4px 0 24px rgba(0,0,0,0.18);
                    }
                    .doc-hamburger { display: flex !important; }
                    .doc-overlay.show {
                        display: block;
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.35);
                        z-index: 40;
                    }
                }
            `}</style>

            {/* Mobile backdrop */}
            <div
                className={`doc-overlay${sidebarOpen ? ' show' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <div className="doc-shell">

                {/* ══ NEW WHITE SIDEBAR ══ */}
                <aside className={`doc-sidebar${sidebarOpen ? ' open' : ''}`}>

                    {/* Logo */}
                    <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
                                <img src={logo} alt="HealthCare Logo" style={{ width: 22, height: 22 }} />
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>HealthCare</p>
                                <p style={{ fontSize: 12, color: '#6B7280', margin: 0, fontWeight: 500 }}>Doctor Portal</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav items */}
                    <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 10 }}>Main Menu</p>
                        {NAV_ITEMS.map(({ id, label, icon }) => (
                            <button
                                key={id}
                                className={`doc-nav${activeView === id ? ' active' : ''}`}
                                onClick={() => {
                                    setActiveView(id);
                                    if (id === 'patients' || id === 'prescriptions') setSearchTerm('');
                                    setSidebarOpen(false);
                                }}
                            >
                                {icon}
                                {label}
                            </button>
                        ))}
                    </nav>

                    {/* User info + Logout */}
                    <div style={{ padding: '14px 16px', borderTop: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <img
                                src={getProfilePictureFromLocal('doctor') || "https://i.pravatar.cc/40?img=3"}
                                alt="Doctor Profile"
                                style={{ width: 38, height: 38, borderRadius: 9, objectFit: 'cover', border: '2px solid #E5E7EB', flexShrink: 0 }}
                            />
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dr. {userEmail}</p>
                                <p style={{ fontSize: 11, color: '#6B7280', margin: 0, fontWeight: 500 }}>Medical Doctor</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 2px rgba(220,38,38,0.15)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#B91C1C'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(220,38,38,0.25)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(220,38,38,0.15)'; }}
                        >
                            <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </aside>

                {/* ══ ORIGINAL RIGHT SIDE — untouched ══ */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Header */}
                    <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Hamburger — CSS hides this on desktop */}
                                <button
                                    className="doc-hamburger"
                                    onClick={() => setSidebarOpen(v => !v)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#374151', alignItems: 'center', justifyContent: 'center' }}
                                    aria-label="Open menu"
                                >
                                    <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Medical Dashboard</h1>
                                    <p className="text-gray-600 text-sm mt-0.5">Welcome back, Dr. {userEmail}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
                                <p className="text-sm font-medium text-gray-700">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* ── CONTENT (100% original) ── */}
                    <main className="flex-1 overflow-y-auto p-6">
                        {activeView === 'dashboard' ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-bold">Total Appointments</p>
                                        <p className="text-3xl font-bold">{appointments.length}</p>
                                    </div>
                                    <div className="">
                                        <img className="h-auto w-15" src={totalPatient} alt="totalPatient" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-bold">Scheduled</p>
                                        <p className="text-3xl font-bold">{scheduledAppointments}</p>
                                    </div>
                                    <div className=""><img className='h-auto w-15' src={scheduled} alt="scheduled" /></div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-100 text-sm font-bold">Completed</p>
                                        <p className="text-3xl font-bold">{completedAppointments}</p>
                                    </div>
                                    <div className=""><img className='h-auto w-15' src={completed} alt="completed" /></div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-bold">Pending</p>
                                        <p className="text-3xl font-bold">{pendingAppointments}</p>
                                    </div>
                                    <div className=""><img className='h-auto w-15' src={pending} alt="pending" /></div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-indigo-100 text-sm font-bold">Today</p>
                                        <p className="text-3xl font-bold">{todayAppointments}</p>
                                    </div>
                                    <div className=""><img src={today} alt="today" /></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-white flex items-center space-x-3">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                            <span>Recent Appointments</span>
                                        </h2>
                                        <p className="text-blue-100 mt-1">Manage your patient appointments</p>
                                    </div>
                                    <button
                                        onClick={fetchAppointments}
                                        disabled={loading}
                                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                </svg>
                                                <span>Refreshing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                <span>Refresh</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-600">Loading appointments...</span>
                                    </div>
                                ) : appointments.length > 0 ? (
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {appointments.map((appointment) => (
                                                <tr key={appointment.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900">Patient #{appointment.patientId}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                            appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                                            appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {appointment.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex space-x-2">
                                                            {appointment.status === 'PENDING' && (
                                                                <button onClick={() => handleStatusUpdate(appointment.id, 'SCHEDULED')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm">Accept</button>
                                                            )}
                                                            {appointment.status === 'SCHEDULED' && (
                                                                <button onClick={() => handleStatusUpdate(appointment.id, 'COMPLETED')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-sm">Complete</button>
                                                            )}
                                                            {appointment.status === 'COMPLETED' && (
                                                                <button onClick={() => { setSelectedAppointment(appointment); setShowPrescriptionModal(true); }} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 shadow-sm">Prescribe</button>
                                                            )}
                                                            {(appointment.status === 'PENDING' || appointment.status === 'SCHEDULED') && (
                                                                <button onClick={() => handleStatusUpdate(appointment.id, 'CANCELED')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 shadow-sm">Cancel</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-12">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                                        <p className="mt-1 text-sm text-gray-500">You don't have any appointments scheduled yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                            </>
                        ) : activeView === 'appointments' ? (
                            <>
                                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 mb-6">
                                        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                            <span>Appointments Calendar</span>
                                        </h2>
                                        <p className="text-emerald-100 mt-1">View and manage your schedule</p>
                                    </div>
                                    <div className="px-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-4">
                                                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                </button>
                                                <h3 className="text-lg font-medium">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                                                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 mb-4">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">{day}</div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                                        <div className="mt-6 flex items-center space-x-4 text-sm pb-6">
                                            <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-600 rounded"></div><span>Today</span></div>
                                            <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-green-400 rounded-full"></div><span>Has Appointments</span></div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : activeView === 'patients' ? (
                            <>
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-6">
                                        <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                            <span>Patient Management</span>
                                        </h2>
                                        <p className="text-purple-100 mt-2">Manage and view your patient records</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <input type="text" placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            </div>
                                            <div className="text-sm text-gray-500">{filteredPatients.length} patients</div>
                                        </div>
                                        <button
                                            onClick={fetchPatients}
                                            disabled={loading}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                    </svg>
                                                    <span>Refreshing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    <span>Refresh</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredPatients.length === 0 ? (
                                            <div className="col-span-full text-center py-12">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
                                                <p className="mt-1 text-sm text-gray-500">Total patients: {patients.length}, Filtered: {filteredPatients.length}</p>
                                            </div>
                                        ) : filteredPatients.map((patient) => (
                                            <div key={patient.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                                <div className="p-6">
                                                    <div className="flex items-center space-x-4 mb-4">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-semibold text-lg">{(patient.firstName?.[0] || '') + (patient.lastName?.[0] || '')}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-gray-900">{patient.firstName} {patient.lastName}</h3>
                                                            <p className="text-sm text-gray-500">ID: {patient.id}</p>
                                                        </div>
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            <span className="text-gray-600">Last Visit: {new Date(patient.appointmentDate).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                            <span className="text-gray-600">Total Appointments: {patient.appointmentCount}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            <span className="text-gray-600">Status: Completed Treatment</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : activeView === 'prescriptions' ? (
                            <>
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 mb-6">
                                        <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM3.293 7.707A1 1 0 014 7h12a1 1 0 01.707.293l2 2a1 1 0 010 1.414l-2 2A1 1 0 0116 13H4a1 1 0 01-.707-.293l-2-2a1 1 0 010-1.414l2-2z" clipRule="evenodd" /></svg>
                                            <span>Prescription Management</span>
                                        </h2>
                                        <p className="text-orange-100 mt-2">Create and manage patient prescriptions</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <input type="text" placeholder="Search prescriptions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            </div>
                                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">New Prescription</button>
                                        </div>
                                        <button
                                            onClick={fetchPrescriptions}
                                            disabled={loading}
                                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                    </svg>
                                                    <span>Refreshing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    <span>Refresh</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {filteredPrescriptions.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                <h3 className="mt-2 text-sm font-medium text-gray-900">No prescriptions found</h3>
                                                                <p className="mt-1 text-sm text-gray-500">Total prescriptions: {prescriptions.length}, Filtered: {filteredPrescriptions.length}</p>
                                                            </td>
                                                        </tr>
                                                    ) : filteredPrescriptions.map((prescription) => (
                                                        <tr key={prescription.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center">
                                                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                                        <span className="text-white font-semibold text-sm">{(prescription.patientFirstName?.[0] || '') + (prescription.patientLastName?.[0] || '')}</span>
                                                                    </div>
                                                                    <div className="ml-3">
                                                                        <p className="text-sm font-medium text-gray-900">{prescription.patientFirstName} {prescription.patientLastName}</p>
                                                                        <p className="text-sm text-gray-500">ID: {prescription.patientId}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{prescription.medicationDetails}</div></td>
                                                            <td className="px-6 py-4"><div className="text-sm text-gray-900">{prescription.dosages}</div></td>
                                                            <td className="px-6 py-4"><div className="text-sm text-gray-900">{new Date(prescription.createdAt).toLocaleDateString()}</div></td>
                                                            <td className="px-6 py-4"><div className="text-sm text-gray-900">-</div></td>
                                                            <td className="px-6 py-4"><span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span></td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex space-x-2">
                                                                    <button onClick={() => handleEditPrescription(prescription)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Edit</button>
                                                                    <button onClick={() => handlePrintPrescription(prescription)} className="text-green-600 hover:text-green-900 text-sm font-medium">Print</button>
                                                                    <button className="text-red-600 hover:text-red-900 text-sm font-medium">Cancel</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : activeView === 'profile' ? (
                            <ProfileSettings 
                                userType="doctor" 
                                userProfile={{ email: userEmail }} 
                                onProfileUpdate={async (updatedProfile) => {
                                    console.log('Updating doctor profile:', updatedProfile);
                                }}
                            />
                        ) : null}
                    </main>
                </div>
            </div>

            {/* Prescription Modal — original */}
            {showPrescriptionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 max-w-md mx-4 border border-slate-200">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM3.293 7.707A1 1 0 014 7h12a1 1 0 01.707.293l2 2a1 1 0 010 1.414l-2 2A1 1 0 0116 13H4a1 1 0 01-.707-.293l-2-2a1 1 0 010-1.414l2-2z" clipRule="evenodd" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Create Prescription</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Patient ID: {selectedAppointment?.patientId}</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Medication Details</label>
                                <textarea value={prescriptionData.medicationDetails} onChange={(e) => setPrescriptionData({...prescriptionData, medicationDetails: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" placeholder="Enter medication details..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dosages</label>
                                <input type="text" value={prescriptionData.dosages} onChange={(e) => setPrescriptionData({...prescriptionData, dosages: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 1 tablet twice daily" />
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button onClick={handleCreatePrescription} className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-sm">Create Prescription</button>
                            <button onClick={() => { setShowPrescriptionModal(false); setPrescriptionData({ medicationDetails: '', dosages: '' }); }} className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Prescription Modal — original */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 max-w-md mx-4 border border-slate-200">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM3.293 7.707A1 1 0 014 7h12a1 1 0 01.707.293l2 2a1 1 0 010 1.414l-2 2A1 1 0 0116 13H4a1 1 0 01-.707-.293l-2-2a1 1 0 010-1.414l2-2z" clipRule="evenodd" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Edit Prescription</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Patient: {editingPrescription?.patientFirstName} {editingPrescription?.patientLastName}</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Medication Details</label>
                                <textarea value={prescriptionData.medicationDetails} onChange={(e) => setPrescriptionData({...prescriptionData, medicationDetails: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" placeholder="Enter medication details..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dosages</label>
                                <input type="text" value={prescriptionData.dosages} onChange={(e) => setPrescriptionData({...prescriptionData, dosages: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 1 tablet twice daily" />
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button onClick={handleUpdatePrescription} className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm">Update Prescription</button>
                            <button onClick={() => { setShowEditModal(false); setEditingPrescription(null); setPrescriptionData({ medicationDetails: '', dosages: '' }); }} className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DoctorDashboard;