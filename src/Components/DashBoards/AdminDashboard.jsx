import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
// eslint-disable-next-line no-unused-vars
import { setDoctors, setPendingDoctors, setLoading as setDoctorsLoading, approveDoctor as approveDoctorAction, rejectDoctor as rejectDoctorAction } from '../../store/slices/doctorsSlice';
import { setPatients, setLoading as setPatientsLoading } from '../../store/slices/patientsSlice';
import { removeToken, getUserEmail, isAuthenticated, setupAxiosInterceptors } from "../../Services/AuthService.js";
import { getDoctors, approveDoctor, rejectDoctor, getPatients, getBilling, updateBillingStatus, getDailyRevenue, getMonthlyRevenue } from "../../Services/AdminService.js";
import logo from "../../assets/OnlyLogo.svg";

const NAV_ITEMS = [
    {
        id: 'doctors', label: 'Doctors',
        icon: <svg width={17} height={17} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
    },
    {
        id: 'patients', label: 'Patients',
        icon: <svg width={17} height={17} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM2 8a2 2 0 114 0A2 2 0 012 8zm16.293 8A6 6 0 0010 12a6 6 0 00-8.293 4H18.293z" clipRule="evenodd" /></svg>,
    },
    {
        id: 'billing', label: 'Billing',
        icon: <svg width={17} height={17} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>,
    },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const userEmail = getUserEmail();

    const { list: doctors, loading: doctorsLoading } = useAppSelector(state => state.doctors);
    const { list: patients, loading: patientsLoading } = useAppSelector(state => state.patients);

    const [billing, setBilling] = useState([]);
    const [dailyRevenue, setDailyRevenue] = useState(0);
    const [monthlyRevenue, setMonthlyRevenue] = useState(0);
    const [activeTab, setActiveTab] = useState('doctors');
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [docPage, setDocPage] = useState(0);
    const [patPage, setPatPage] = useState(0);
    const [billPage, setBillPage] = useState(0);

    const [docTotalPages, setDocTotalPages] = useState(1);
    const [patTotalPages, setPatTotalPages] = useState(1);
    const [billTotalPages, setBillTotalPages] = useState(1);
    const SIZE = 10;

    const loading = activeTab === 'doctors' ? doctorsLoading
        : activeTab === 'patients' ? patientsLoading : false;

    const handleLogout = useCallback(() => {
        removeToken(); navigate('/login', { replace: true });
    }, [navigate]);

    useEffect(() => {
        setupAxiosInterceptors();
        if (!isAuthenticated()) { handleLogout(); return; }
        fetchRevenue(); // Revenue sirf ek baar fetch hoga
    }, []);

   
    const fetchDoctors = async () => {
        try {
            setError(null); dispatch(setDoctorsLoading(true));
            const r = await getDoctors(docPage, SIZE);
            dispatch(setDoctors(r.data.content || r.data)); // Sirf array dispatch karo
            setDocTotalPages(r.data.totalPages || 1);
        } catch (e) {
            if (!e.response || ![401, 403].includes(e.response.status))
                setError('Failed to load doctors. Please try again.');
        } finally { dispatch(setDoctorsLoading(false)); }
    };

    const fetchRevenue = async () => {
        try {
            const [daily, monthly] = await Promise.all([getDailyRevenue(), getMonthlyRevenue()]);
            setDailyRevenue(daily.data); setMonthlyRevenue(monthly.data);
        } catch { }
    };

    const showNotification = (message, type) => {
        const el = document.createElement('div');
        Object.assign(el.style, {
            position: 'fixed', top: '20px', right: '20px', zIndex: '9999',
            padding: '12px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            background: type === 'success' ? '#059669' : '#DC2626', color: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        });
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    };

    const handleApprove = async (id) => {
        try {
            setActionLoading(`approve-${id}`);
            await approveDoctor(id); dispatch(approveDoctorAction(id));
            showNotification('Doctor approved successfully!', 'success');
        } catch (e) {
            if (!e.response || ![401, 403].includes(e.response.status))
                showNotification('Failed to approve doctor.', 'error');
        } finally { setActionLoading(null); }
    };

    const handleReject = async (id) => {
        try {
            setActionLoading(`reject-${id}`);
            await rejectDoctor(id); dispatch(rejectDoctorAction(id));
            showNotification('Doctor rejected successfully!', 'success');
        } catch (e) {
            if (!e.response || ![401, 403].includes(e.response.status))
                showNotification('Failed to reject doctor.', 'error');
        } finally { setActionLoading(null); }
    };

    const handleBillingStatusUpdate = async (id, status) => {
        try {
            setActionLoading(`billing-${id}`);
            await updateBillingStatus(id, status);
            setBilling(prev => prev.map(b => b.id === id ? { ...b, billingStatus: status } : b));
            fetchRevenue();
        } catch { }
        finally { setActionLoading(null); }
    };

    const refreshCurrent = () =>
        activeTab === 'doctors' ? fetchDoctors() :
            activeTab === 'patients' ? fetchPatients() : fetchBilling();

    const PAGE_TITLE = activeTab === 'doctors' ? 'Doctor Management'
        : activeTab === 'patients' ? 'Patient Management'
            : 'Billing Management';
    const PAGE_SUB = activeTab === 'doctors' ? 'Approve and manage doctor registrations'
        : activeTab === 'patients' ? 'View and manage patient records'
            : 'Manage payments and billing';

    /* ─── shared cell style ─── */
    const td = (extra = {}) => ({ padding: '12px 16px', fontSize: 14, color: '#374151', ...extra });
    const th = { padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', background: '#F9FAFB' };

    return (
        <>
            <style>{`
                .adm-root {
                    display:flex; height:100vh; overflow:hidden;
                    background:#F3F4F6;
                    font-family:'Inter','Segoe UI',system-ui,sans-serif;
                    font-size:14px; color:#111827;
                }
                /* sidebar */
                .adm-sidebar {
                    width:210px; flex-shrink:0;
                    background:#fff; border-right:1px solid #E5E7EB;
                    display:flex; flex-direction:column;
                    box-shadow:1px 0 6px rgba(0,0,0,0.04);
                    transition:transform 0.25s ease; z-index:50;
                }
                .adm-nav {
                    display:flex; align-items:center; gap:10px;
                    width:100%; padding:9px 10px; margin-bottom:2px;
                    border:none; border-radius:8px;
                    border-left:3px solid transparent;
                    background:transparent !important; color:#374151;
                    font-size:14px; font-weight:500;
                    cursor:pointer; text-align:left;
                    transition:color 0.15s,border-color 0.15s;
                }
                .adm-nav.active {
                    background:#EFF6FF !important;
                    color:#2563EB !important;
                    font-weight:600;
                    border-left-color:#2563EB !important;
                }
                /* table rows */
                .adm-tr { border-bottom:1px solid #F3F4F6; transition:background 0.1s; }
                .adm-tr:hover td { background:#F9FAFB; }
                /* action btns */
                .ab { padding:6px 13px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; border:none; transition:background 0.12s; white-space:nowrap; }
                .ab:disabled { opacity:.45; cursor:not-allowed; }
                .ab-green { background:#059669; color:#fff; }
                .ab-green:hover:not(:disabled) { background:#047857; }
                .ab-red   { background:#DC2626; color:#fff; }
                .ab-red:hover:not(:disabled)   { background:#B91C1C; }
                .ab-ghost { background:#fff; color:#374151; border:1px solid #D1D5DB; }
                .ab-ghost:hover:not(:disabled) { background:#F3F4F6; }
                /* hamburger hidden on desktop */
                .adm-hamburger { display:none; }
                @media (max-width:767px) {
                    .adm-sidebar { position:fixed; top:0; left:0; bottom:0; transform:translateX(-100%); }
                    .adm-sidebar.open { transform:translateX(0); box-shadow:4px 0 20px rgba(0,0,0,0.15); }
                    .adm-hamburger { display:flex; }
                }
                @keyframes adm-spin { to { transform:rotate(360deg); } }
                .adm-spinner { width:30px; height:30px; margin:0 auto 12px; border:3px solid #E5E7EB; border-top-color:#2563EB; border-radius:50%; animation:adm-spin 0.7s linear infinite; }
            `}</style>

            <div className="adm-root">

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div onClick={() => setSidebarOpen(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 40 }} />
                )}

                {/* ══ SIDEBAR ══ */}
                <aside className={`adm-sidebar${sidebarOpen ? ' open' : ''}`}>

                    {/* Logo */}
                    <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #F3F4F6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#2563EB', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={logo} alt="logo" style={{ width: 20, height: 20 }} />
                            </div>
                            <div>
                                <p style={{ fontWeight: 800, fontSize: 14, color: '#111827', margin: 0 }}>HealthCare</p>
                                <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>Admin Portal</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav style={{ flex: 1, padding: '14px 10px' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>
                            Menu
                        </p>
                        {NAV_ITEMS.map(({ id, label, icon }) => (
                            <button
                                key={id}
                                className={`adm-nav${activeTab === id ? ' active' : ''}`}
                                onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                            >
                                {icon}
                                {label}
                            </button>
                        ))}
                    </nav>

                    {/* User + Logout */}
                    <div style={{ padding: '12px 14px', borderTop: '1px solid #F3F4F6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EFF6FF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width={18} height={18} fill="#2563EB" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Admin</p>
                                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#B91C1C'}
                            onMouseLeave={e => e.currentTarget.style.background = '#DC2626'}
                        >
                            <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </aside>

                {/* ══ MAIN ══ */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

                    {/* Header */}
                    <header style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', padding: '0 24px', height: 58, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <button className="adm-hamburger" onClick={() => setSidebarOpen(v => !v)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#374151' }}>
                                <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <h1 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>Admin Dashboard</h1>
                                <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Admin</p>
                                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{userEmail}</p>
                            </div>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width={18} height={18} fill="#2563EB" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>

                        {/* Revenue strip — billing only */}
                        {activeTab === 'billing' && (
                            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                                {[['Daily Revenue', `₹${dailyRevenue}`], ['Monthly Revenue', `₹${monthlyRevenue}`]].map(([l, v]) => (
                                    <div key={l} style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: '14px 20px', minWidth: 160, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                                        <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{l}</p>
                                        <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>{v}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Table card */}
                        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                            {/* Card header */}
                            <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>{PAGE_TITLE}</p>
                                    <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{PAGE_SUB}</p>
                                </div>
                                <button className="ab ab-ghost" onClick={refreshCurrent} disabled={loading}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '7px 14px', borderRadius: 7 }}>
                                    <svg width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {loading ? 'Loading…' : 'Refresh'}
                                </button>
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA', color: '#991B1B', padding: '10px 18px', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {error}
                                    <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B', fontWeight: 700, fontSize: 16 }}>×</button>
                                </div>
                            )}

                            {/* Spinner */}
                            {loading ? (
                                <div style={{ padding: '56px 24px', textAlign: 'center', color: '#9CA3AF' }}>
                                    <div className="adm-spinner" />
                                    <p style={{ margin: 0 }}>Loading {activeTab}…</p>
                                </div>

                            ) : activeTab === 'doctors' ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead><tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                            {['ID', 'Doctor Name', 'Specialty', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}
                                        </tr></thead>
                                        <tbody>
                                            {doctors.length === 0
                                                ? <tr><td colSpan={5} style={{ padding: '56px 24px', textAlign: 'center', color: '#9CA3AF' }}>
                                                    <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>No doctors found</p>
                                                    <p style={{ fontSize: 13, margin: 0 }}>No doctor registrations available.</p>
                                                </td></tr>
                                                : doctors.map(doc => {
                                                    const approved = doc.isApproved || doc.status === 'APPROVED';
                                                    const rejected = doc.status === 'REJECTED';
                                                    return (
                                                        <tr key={doc.id} className="adm-tr">
                                                            <td style={td({ color: '#6B7280', fontFamily: 'monospace', fontSize: 13 })}>{doc.id}</td>
                                                            <td style={td()}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid #BFDBFE' }}>
                                                                        {(doc.firstName?.[0] || '').toUpperCase()}{(doc.lastName?.[0] || '').toUpperCase()}
                                                                    </div>
                                                                    <span style={{ fontWeight: 600 }}>Dr. {doc.firstName} {doc.lastName}</span>
                                                                </div>
                                                            </td>
                                                            <td style={td()}>{doc.specialty}</td>
                                                            <td style={td()}>
                                                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-block', background: approved ? '#ECFDF5' : rejected ? '#FEF2F2' : '#FFFBEB', color: approved ? '#065F46' : rejected ? '#991B1B' : '#92400E' }}>
                                                                    {approved ? 'Approved' : rejected ? 'Rejected' : 'Pending'}
                                                                </span>
                                                            </td>
                                                            <td style={td()}>
                                                                <div style={{ display: 'flex', gap: 8 }}>
                                                                    {!approved && <button className="ab ab-green" onClick={() => handleApprove(doc.id)} disabled={actionLoading === `approve-${doc.id}`}>{actionLoading === `approve-${doc.id}` ? 'Approving…' : 'Approve'}</button>}
                                                                    {!rejected && <button className="ab ab-red" onClick={() => handleReject(doc.id)} disabled={actionLoading === `reject-${doc.id}`}>{actionLoading === `reject-${doc.id}` ? 'Processing…' : approved ? 'Revoke' : 'Reject'}</button>}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            }
                                        </tbody>
                                    </table>
                                    {/* Add this inside the Doctors div, below </table> */}
                                    {docTotalPages > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                                            <button className="ab ab-ghost" disabled={docPage === 0} onClick={() => setDocPage(p => p - 1)}>Previous</button>
                                            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Page {docPage + 1} of {docTotalPages}</span>
                                            <button className="ab ab-ghost" disabled={docPage >= docTotalPages - 1} onClick={() => setDocPage(p => p + 1)}>Next</button>
                                        </div>
                                    )}
                                </div>

                            ) : activeTab === 'patients' ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead><tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                            {['ID', 'Patient Name', 'Contact', 'Date of Birth', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}
                                        </tr></thead>
                                        <tbody>
                                            {patients.length === 0
                                                ? <tr><td colSpan={5} style={{ padding: '56px 24px', textAlign: 'center', color: '#9CA3AF' }}>
                                                    <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>No patients found</p>
                                                    <p style={{ fontSize: 13, margin: 0 }}>No patient records available.</p>
                                                </td></tr>
                                                : patients.map(p => (
                                                    <tr key={p.id} className="adm-tr">
                                                        <td style={td({ color: '#6B7280', fontFamily: 'monospace', fontSize: 13 })}>{p.id}</td>
                                                        <td style={td()}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid #A7F3D0' }}>
                                                                    {(p.firstName?.[0] || '').toUpperCase()}{(p.lastName?.[0] || '').toUpperCase()}
                                                                </div>
                                                                <span style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</span>
                                                            </div>
                                                        </td>
                                                        <td style={td()}>{p.contactNumber || '—'}</td>
                                                        <td style={td()}>{p.dob || '—'}</td>
                                                        <td style={td()}><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: '#EFF6FF', color: '#1E40AF', display: 'inline-block' }}>Active</span></td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                    {/* Add this inside the Patients div, below </table> */}
                                    {patTotalPages > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                                            <button className="ab ab-ghost" disabled={patPage === 0} onClick={() => setPatPage(p => p - 1)}>Previous</button>
                                            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Page {patPage + 1} of {patTotalPages}</span>
                                            <button className="ab ab-ghost" disabled={patPage >= patTotalPages - 1} onClick={() => setPatPage(p => p + 1)}>Next</button>
                                        </div>
                                    )}
                                </div>

                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead><tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                            {['Billing ID', 'Appointment ID', 'Amount', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}
                                        </tr></thead>
                                        <tbody>
                                            {billing.length === 0
                                                ? <tr><td colSpan={5} style={{ padding: '56px 24px', textAlign: 'center', color: '#9CA3AF' }}>
                                                    <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>No billing records found</p>
                                                    <p style={{ fontSize: 13, margin: 0 }}>No billing data available.</p>
                                                </td></tr>
                                                : billing.map(b => (
                                                    <tr key={b.id} className="adm-tr">
                                                        <td style={td({ color: '#6B7280', fontFamily: 'monospace', fontSize: 13 })}>{b.id}</td>
                                                        <td style={td({ color: '#6B7280', fontFamily: 'monospace', fontSize: 13 })}>{b.appointmentId}</td>
                                                        <td style={td({ fontWeight: 700, fontSize: 15 })}>₹{b.amount}</td>
                                                        <td style={td()}>
                                                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-block', background: b.billingStatus === 'PAID' ? '#ECFDF5' : '#FEF2F2', color: b.billingStatus === 'PAID' ? '#065F46' : '#991B1B' }}>
                                                                {b.billingStatus || 'UNPAID'}
                                                            </span>
                                                        </td>
                                                        <td style={td()}>
                                                            <div style={{ display: 'flex', gap: 8 }}>
                                                                <button className="ab ab-green" onClick={() => handleBillingStatusUpdate(b.id, 'PAID')} disabled={actionLoading === `billing-${b.id}` || b.billingStatus === 'PAID'}>Mark Paid</button>
                                                                <button className="ab ab-ghost" onClick={() => handleBillingStatusUpdate(b.id, 'UNPAID')} disabled={actionLoading === `billing-${b.id}` || b.billingStatus === 'UNPAID'}>Mark Unpaid</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                    {/* Add this inside the Billing div, below </table> */}
                                    {billTotalPages > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                                            <button className="ab ab-ghost" disabled={billPage === 0} onClick={() => setBillPage(p => p - 1)}>Previous</button>
                                            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Page {billPage + 1} of {billTotalPages}</span>
                                            <button className="ab ab-ghost" disabled={billPage >= billTotalPages - 1} onClick={() => setBillPage(p => p + 1)}>Next</button>
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;