import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setAppointments, setLoading, updateAppointment, setPatients } from '../../store/slices/appointmentsSlice';
import { setPrescriptions, addPrescription } from '../../store/slices/prescriptionsSlice';
import { selectCompletedAppointments, selectPendingAppointments, selectScheduledAppointments, selectTodayAppointments } from '../../store/selectors';

import { removeToken, getUserEmail, setupAxiosInterceptors } from "../../Services/AuthService.js";
import toast, { Toaster } from 'react-hot-toast';
// eslint-disable-next-line no-unused-vars
import { getMyAppointments, updateAppointmentStatus, createPrescription, getMyPatients, getMyPrescriptions, getDoctorProfile, getMyNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from "../../Services/DoctorService.js";
import { getProfilePictureFromLocal } from "../../Services/ProfileService.js";
import ProfileSettings from "../ProfileSettings.jsx";
import logo from "../../assets/OnlyLogo.svg"
import totalPatient from "../../assets/totalPatient.svg"
import scheduled from "../../assets/scheduled.svg"
import completed from "../../assets/completed.svg"
import pending from "../../assets/pending.svg"
import today from "../../assets/today.svg"

/* ─────────────────────────────────────────────
   NOTIFICATION BELL
───────────────────────────────────────────── */
const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifs, setLoadingNotifs] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const fetchCount = async () => {
            try { const res = await getUnreadCount(); setUnreadCount(res.data); } catch { }
        };
        fetchCount();
        window.addEventListener('focus', fetchCount);
        return () => window.removeEventListener('focus', fetchCount);
    }, []);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = async () => {
        const next = !open;
        setOpen(next);
        if (next) {
            try { const res = await getMyNotifications(); setNotifications(res.data); } catch { }
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch { }
    };

    const handleMarkAll = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch { }
    };

    return (
        <div ref={ref} className="relative">
            <button onClick={handleOpen} className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <span className="font-semibold text-sm text-slate-800">Notifications</span>
                        {notifications.some(n => !n.read) && (
                            <button onClick={handleMarkAll} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {loadingNotifs ? (
                            <p className="text-center py-6 text-sm text-slate-500">Loading...</p>
                        ) : notifications.length === 0 ? (
                            <p className="text-center py-6 text-sm text-slate-500">No new notifications</p>
                        ) : notifications.map(n => (
                            <div key={n.id} className={`px-4 py-3 border-b border-slate-50 last:border-0 ${n.read ? 'bg-white' : 'bg-blue-50/50'}`}>
                                <p className="text-sm text-slate-700 leading-snug mb-1.5">{n.message}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">
                                        {new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {!n.read && (
                                        <button onClick={() => handleMarkRead(n.id)} className="text-[11px] font-medium text-blue-600 hover:text-blue-800">
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const userEmail = getUserEmail();
    const [doctorProfile, setDoctorProfile] = useState(null);
    const displayName = doctorProfile ? `${doctorProfile.firstName} ${doctorProfile.lastName}` : userEmail;

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
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        setupAxiosInterceptors();
        fetchAppointments();
        fetchPrescriptions();
        getDoctorProfile().then(res => setDoctorProfile(res.data)).catch((err) => console.error('getDoctorProfile failed:', err?.response?.status, err?.response?.data));
    }, []);

    useEffect(() => {
        if (appointments.length > 0) {
            fetchPatients();
        }
    }, [appointments]);

    const fetchPatients = async () => {
        try {
            const response = await getMyPatients();
            dispatch(setPatients(response.data || []));
        } catch (error) {
            console.error('Error fetching patients:', error);
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
            const response = await getMyPrescriptions();
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
        setActionLoading(prev => ({ ...prev, [appointmentId]: newStatus }));
        try {
            const response = await updateAppointmentStatus(appointmentId, newStatus);
            dispatch(updateAppointment(response.data));
            const messages = { SCHEDULED: 'Appointment accepted!', COMPLETED: 'Appointment marked as completed!', CANCELED: 'Appointment cancelled.' };
            toast.success(messages[newStatus] || 'Status updated!', { position: 'top-right' });
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status. Please try again.', { position: 'top-right' });
        } finally {
            setActionLoading(prev => { const s = { ...prev }; delete s[appointmentId]; return s; });
        }
    };

    const handleCreatePrescription = async () => {
        setActionLoading(prev => ({ ...prev, [selectedAppointment.id]: 'PRESCRIBING' }));
        try {
            const prescription = {
                appointmentId: selectedAppointment.id,
                patientId: selectedAppointment.patientId,
                medicationDetails: prescriptionData.medicationDetails,
                dosages: prescriptionData.dosages
            };
            const response = await createPrescription(prescription);
            dispatch(addPrescription(response.data));
            setShowPrescriptionModal(false);
            setPrescriptionData({ medicationDetails: '', dosages: '' });
            toast.success('Prescription created successfully!', { position: 'top-right' });
        } catch (error) {
            console.error('Error creating prescription:', error);
            toast.error('Failed to create prescription. Please try again.', { position: 'top-right' });
        } finally {
            setActionLoading(prev => { const s = { ...prev }; delete s[selectedAppointment.id]; return s; });
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
        const w = window.open('', '_blank');
        const patientName = `${prescription.patientFirstName || ''} ${prescription.patientLastName || ''}`.trim() || 'N/A';
        const doctorName = (prescription.doctorFirstName && prescription.doctorLastName)
            ? `Dr. ${prescription.doctorFirstName} ${prescription.doctorLastName}`
            : `Dr. ${displayName}`;
        const issueDate = prescription.createdAt
            ? new Date(prescription.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
            : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const medications = prescription.medicationDetails.split(',').map(m => m.trim()).filter(Boolean);
        const dosages = prescription.dosages.split(',').map(d => d.trim()).filter(Boolean);
        w.document.write(`<!DOCTYPE html><html><head><title>Prescription #${prescription.id}</title><style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #e2e8f0; display: flex; justify-content: center; padding: 40px 20px; color: #0f172a; }
            .slip { background: #fff; width: 210mm; min-height: 297mm; padding: 40px 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
            .clinic-brand h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; }
            .clinic-brand p { font-size: 12px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
            .meta-info { text-align: right; }
            .meta-info p { font-size: 13px; color: #475569; line-height: 1.6; }
            .meta-info strong { color: #0f172a; }
            .doctor-info { margin-bottom: 30px; }
            .doctor-info h2 { font-size: 18px; font-weight: 700; color: #0f172a; }
            .doctor-info p { font-size: 13px; color: #64748b; font-weight: 500; }
            .rx-symbol { font-size: 42px; font-weight: 700; font-family: serif; color: #0f172a; margin-bottom: 20px; line-height: 1; }
            .patient-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 40px; }
            .data-group label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
            .data-group p { font-size: 14px; font-weight: 600; color: #0f172a; }
            .med-section h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
            .med-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .med-table th { font-size: 11px; text-transform: uppercase; color: #64748b; text-align: left; padding: 12px 8px; border-bottom: 2px solid #cbd5e1; }
            .med-table td { padding: 16px 8px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
            .med-table td:first-child { font-weight: 600; color: #64748b; width: 40px; }
            .med-name { font-weight: 700; display: block; margin-bottom: 4px; }
            .footer { padding-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
            .instructions { max-width: 60%; font-size: 11px; color: #64748b; line-height: 1.5; border-left: 3px solid #cbd5e1; padding-left: 12px; }
            .signature-block { text-align: center; width: 220px; }
            .signature-line { border-bottom: 1px solid #0f172a; margin-bottom: 8px; height: 40px; }
            .signature-block p { font-size: 12px; font-weight: 600; color: #0f172a; }
            .signature-block span { font-size: 10px; color: #64748b; }
            @media print { body { background: #fff; padding: 0; } .slip { box-shadow: none; width: 100%; min-height: auto; padding: 0; } @page { margin: 15mm; } }
        </style></head><body><div class='slip'>
            <div class='header'>
                <div class='clinic-brand'><h1>HealthCare Center</h1><p>Advanced Medical Services</p></div>
                <div class='meta-info'><p><strong>Record No:</strong> #${prescription.id}</p><p><strong>Date:</strong> ${issueDate}</p></div>
            </div>
            <div class='doctor-info'><h2>${doctorName}</h2><p>MBBS, MD &mdash; General Medicine</p></div>
            <div class='patient-grid'>
                <div class='data-group'><label>Patient Name</label><p>${patientName}</p></div>
                <div class='data-group'><label>Patient ID</label><p>P-${prescription.patientId || 'N/A'}</p></div>
                <div class='data-group'><label>Appointment Ref</label><p>#${prescription.appointmentId}</p></div>
                <div class='data-group'><label>Valid Until</label><p>30 Days from Issue</p></div>
            </div>
            <div class='rx-symbol'>&#8478;</div>
            <div class='med-section'>
                <h3>Prescription Details</h3>
                <table class='med-table'>
                    <thead><tr><th>#</th><th>Medication</th><th>Dosage &amp; Instructions</th></tr></thead>
                    <tbody>${medications.map((med, idx) => `<tr><td>0${idx + 1}</td><td><span class='med-name'>${med}</span></td><td>${dosages[idx] || dosages[0] || 'Take as directed'}</td></tr>`).join('')}</tbody>
                </table>
            </div>
            <div class='footer'>
                <div class='instructions'><strong>Important:</strong> Keep all medicines out of reach of children. Follow dosage instructions carefully.</div>
                <div class='signature-block'><div class='signature-line'></div><p>${doctorName}</p><span>Authorized Signature &amp; Stamp</span></div>
            </div>
        </div><script>window.onload=()=>setTimeout(()=>window.print(),150);</script></body></html>`);
        w.document.close();
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
            days.push(<div key={`empty-${i}`} className="h-10"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayAppointments = getAppointmentsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            days.push(
                <div key={day} className={`h-12 border border-slate-100 flex flex-col items-center justify-center relative transition-colors ${isToday ? 'bg-blue-50 font-bold text-blue-700' : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                    <span className="text-sm">{day}</span>
                    {dayAppointments.length > 0 && (
                        <div className="absolute bottom-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    )}
                </div>
            );
        }
        return days;
    };

    const NAV_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
        { id: 'appointments', label: 'Appointments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { id: 'patients', label: 'Patients', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { id: 'prescriptions', label: 'Prescriptions', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { id: 'profile', label: 'Profile Settings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
            <Toaster />

            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Logo */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex flex-shrink-0 items-center justify-center shadow-sm">
                            <img src={logo} alt="Logo" className="w-6 h-6 brightness-0 invert" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-slate-800 tracking-tight leading-tight">HealthCare</p>
                            <p className="text-xs text-slate-500 font-medium">Doctor Portal</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Main Menu</p>
                    {NAV_ITEMS.map(({ id, label, icon }) => (
                        <button
                            key={id}
                            onClick={() => { setActiveView(id); if (id === 'patients' || id === 'prescriptions') setSearchTerm(''); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeView === id
                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <span className={activeView === id ? 'text-blue-600' : 'text-slate-400'}>{icon}</span>
                            {label}
                        </button>
                    ))}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <img
                            src={doctorProfile?.profilePicture || "https://i.pravatar.cc/150?img=11"}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">Dr. {displayName}</p>
                            <p className="text-xs text-slate-500 truncate">Medical Doctor</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-50 hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-200 hover:border-red-100"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Medical Dashboard</h1>
                            <p className="text-sm text-slate-500 hidden sm:block">Welcome back, Dr. {displayName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <img
                            src={doctorProfile?.profilePicture || "https://i.pravatar.cc/150?img=11"}
                            alt="Profile"
                            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {activeView === 'dashboard' ? (
                        <div className="max-w-7xl mx-auto space-y-8">
                            {/* Stats Grid - Cleaned up */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {[
                                    { label: 'Total Patients', val: appointments.length, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { label: 'Scheduled', val: scheduledAppointments, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { label: 'Completed', val: completedAppointments, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                    { label: 'Pending', val: pendingAppointments, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    { label: 'Today', val: todayAppointments, color: 'text-purple-600', bg: 'bg-purple-50' }
                                ].map((stat, idx) => (
                                    <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                                            <p className="text-2xl font-bold text-slate-800">{stat.val}</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                            {/* Generic placeholder icon - replace with actual SVGs if preferred */}
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Appointments Table */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Recent Appointments</h2>
                                        <p className="text-sm text-slate-500">Manage today's schedule</p>
                                    </div>
                                    <button
                                        onClick={fetchAppointments}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    >
                                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        Refresh
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {loading ? (
                                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading appointments...</td></tr>
                                            ) : appointments.length === 0 ? (
                                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No recent appointments found.</td></tr>
                                            ) : (
                                                appointments.map((appointment) => (
                                                    <tr key={appointment.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                                                                    {(appointment.patientFirstName?.[0] || '')}{(appointment.patientLastName?.[0] || '')}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-900">{appointment.patientFirstName} {appointment.patientLastName}</p>
                                                                    <p className="text-xs text-slate-500">ID: {appointment.patientId}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-slate-900">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                                                            <p className="text-xs text-slate-500">{appointment.appointmentTime ? new Date(`1970-01-01T${appointment.appointmentTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-slate-600 truncate max-w-[200px]" title={appointment.reasonForVisit}>{appointment.reasonForVisit || '—'}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${appointment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                appointment.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    appointment.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                        'bg-red-50 text-red-700 border-red-200'
                                                                }`}>
                                                                {appointment.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {appointment.status === 'PENDING' && (
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(appointment.id, 'SCHEDULED')}
                                                                        disabled={!!actionLoading[appointment.id]}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                                    >
                                                                        {actionLoading[appointment.id] === 'SCHEDULED' && <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                                                                        {actionLoading[appointment.id] === 'SCHEDULED' ? 'Accepting...' : 'Accept'}
                                                                    </button>
                                                                )}
                                                                {appointment.status === 'SCHEDULED' && (
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(appointment.id, 'COMPLETED')}
                                                                        disabled={!!actionLoading[appointment.id]}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                                    >
                                                                        {actionLoading[appointment.id] === 'COMPLETED' && <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                                                                        {actionLoading[appointment.id] === 'COMPLETED' ? 'Completing...' : 'Complete'}
                                                                    </button>
                                                                )}
                                                                {appointment.status === 'COMPLETED' && (
                                                                    <button
                                                                        onClick={() => { setSelectedAppointment(appointment); setShowPrescriptionModal(true); }}
                                                                        disabled={!!actionLoading[appointment.id]}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                                    >
                                                                        {actionLoading[appointment.id] === 'PRESCRIBING' && <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                                                                        {actionLoading[appointment.id] === 'PRESCRIBING' ? 'Prescribing...' : 'Prescribe'}
                                                                    </button>
                                                                )}
                                                                {(appointment.status === 'PENDING' || appointment.status === 'SCHEDULED') && (
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(appointment.id, 'CANCELED')}
                                                                        disabled={!!actionLoading[appointment.id]}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                                    >
                                                                        {actionLoading[appointment.id] === 'CANCELED' && <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                                                                        {actionLoading[appointment.id] === 'CANCELED' ? 'Canceling...' : 'Cancel'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : activeView === 'appointments' ? (
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Appointments Calendar</h2>
                                    <p className="text-sm text-slate-500 mt-1">View and manage your upcoming schedule</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <h3 className="text-lg font-bold text-slate-800 min-w-[150px] text-center">
                                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </h3>
                                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="bg-slate-50 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{day}</div>
                                    ))}
                                    {renderCalendar()}
                                </div>
                            </div>
                        </div>
                    ) : activeView === 'patients' ? (
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Patient Directory</h2>
                                    <p className="text-sm text-slate-500 mt-1">Manage and view your patient records</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        <input
                                            type="text"
                                            placeholder="Search patients..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                                        />
                                    </div>
                                    <button onClick={fetchPatients} disabled={loading} className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                                        <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPatients.length === 0 ? (
                                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200">
                                        <p className="text-slate-500 text-sm">No patients found matching your search.</p>
                                    </div>
                                ) : filteredPatients.map((patient) => (
                                    <div key={patient.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-lg font-bold">
                                                    {(patient.firstName?.[0] || '')}{(patient.lastName?.[0] || '')}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{patient.firstName} {patient.lastName}</h3>
                                                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {patient.id}</p>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wide">Active</span>
                                        </div>
                                        <div className="space-y-2.5 pt-4 border-t border-slate-100">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Last Visit</span>
                                                <span className="font-medium text-slate-700">{new Date(patient.appointmentDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Total Visits</span>
                                                <span className="font-medium text-slate-700">{patient.appointmentCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : activeView === 'prescriptions' ? (
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Prescription Records</h2>
                                    <p className="text-sm text-slate-500 mt-1">Manage historical and active prescriptions</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        <input
                                            type="text"
                                            placeholder="Search medications..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Medication</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dosage</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Issued</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredPrescriptions.length === 0 ? (
                                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No prescriptions found.</td></tr>
                                            ) : filteredPrescriptions.map((prescription) => (
                                                <tr key={prescription.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900">{prescription.patientFirstName} {prescription.patientLastName}</p>
                                                            <p className="text-xs text-slate-500">ID: {prescription.patientId}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-medium text-slate-800">{prescription.medicationDetails}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-slate-600">{prescription.dosages}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-slate-600">{new Date(prescription.createdAt).toLocaleDateString()}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <button onClick={() => handleEditPrescription(prescription)} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                                                            <button onClick={() => handlePrintPrescription(prescription)} className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">Print</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : activeView === 'profile' ? (
                        <div className="max-w-4xl mx-auto">
                            <ProfileSettings
                                userType="doctor"
                                userProfile={doctorProfile}
                                onProfileUpdate={async (updatedProfile) => {
                                    setDoctorProfile(prev => ({ ...prev, ...updatedProfile }));
                                }}
                            />
                        </div>
                    ) : null}
                </main>
            </div>

            {/* Modal Layer */}
            {(showPrescriptionModal || showEditModal) && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">
                                {showPrescriptionModal ? 'Issue New Prescription' : 'Edit Prescription'}
                            </h3>
                            <button
                                onClick={() => { setShowPrescriptionModal(false); setShowEditModal(false); setPrescriptionData({ medicationDetails: '', dosages: '' }); }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-medium border border-blue-100 flex gap-2">
                                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                {showPrescriptionModal ? `Patient ID: ${selectedAppointment?.patientId}` : `Patient: ${editingPrescription?.patientFirstName} ${editingPrescription?.patientLastName}`}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Medication Details</label>
                                <textarea
                                    value={prescriptionData.medicationDetails}
                                    onChange={(e) => setPrescriptionData({ ...prescriptionData, medicationDetails: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                                    rows="4"
                                    placeholder="Enter medication names, strengths, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dosage Instructions</label>
                                <input
                                    type="text"
                                    value={prescriptionData.dosages}
                                    onChange={(e) => setPrescriptionData({ ...prescriptionData, dosages: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                                    placeholder="e.g., 1 tablet twice daily after meals"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowPrescriptionModal(false); setShowEditModal(false); setPrescriptionData({ medicationDetails: '', dosages: '' }); }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showPrescriptionModal ? handleCreatePrescription : handleUpdatePrescription}
                                disabled={showPrescriptionModal && !!actionLoading[selectedAppointment?.id]}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {showPrescriptionModal && actionLoading[selectedAppointment?.id] === 'PRESCRIBING' && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                                {showPrescriptionModal
                                    ? (actionLoading[selectedAppointment?.id] === 'PRESCRIBING' ? 'Saving...' : 'Confirm & Save')
                                    : 'Update Record'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;