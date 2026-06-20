import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { LogOut, Menu, X, LayoutDashboard, Users, CalendarPlus, CalendarCheck, FileText, Settings, Bell, ChevronRight } from "lucide-react";
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setAppointments, setLoading } from '../../store/slices/appointmentsSlice';
import { setPrescriptions } from '../../store/slices/prescriptionsSlice';
import { setCurrentPatient } from '../../store/slices/patientsSlice';
import { removeToken, getUserEmail } from "../../Services/AuthService.js";
import { getMyAppointments, getMyPrescriptions, getMyProfile, getMyNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from "../../Services/PatientService.js";
import { getProfilePictureFromLocal } from "../../Services/ProfileService.js";
import logo from "../../assets/OnlyLogo.svg";
import DoctorsList from "../Patient SubComponent/DoctorsList.jsx";
import NewAppointment from "../Patient SubComponent/NewAppointment.jsx";
import AppointmentHistory from "../Patient SubComponent/AppointmentHistory.jsx";
import ProfileSettings from "../ProfileSettings.jsx";
import defaultpfp from "/deafaultpfp.jpg";


/* ─────────────────────────────────────────────
   NOTIFICATION BELL
───────────────────────────────────────────── */
const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const ref = React.useRef(null);

    // fetch count on mount + whenever user focuses the tab
    useEffect(() => {
        const fetchCount = async () => {
            try { const res = await getUnreadCount(); setUnreadCount(res.data); } catch {}
        };
        fetchCount();
        window.addEventListener("focus", fetchCount);
        return () => window.removeEventListener("focus", fetchCount);
    }, []);

    // close dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // fetch list only when dropdown opens
    const handleOpen = async () => {
        const next = !open;
        setOpen(next);
        if (next) {
            try { const res = await getMyNotifications(); setNotifications(res.data); } catch {}
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch {}
    };

    const handleMarkAll = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch {}
    };

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button onClick={handleOpen} className="btn-reset"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 6, borderRadius: 8, display: "flex", position: "relative" }}>
                <Bell size={19} />
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute", top: 2, right: 2,
                        background: "#DC2626", color: "#fff",
                        fontSize: 10, fontWeight: 700,
                        borderRadius: "50%", width: 16, height: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        lineHeight: 1,
                    }}>{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
            </button>

            {open && (
                <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    width: 320, background: "#fff",
                    border: "1px solid #E5E7EB", borderRadius: 10,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    zIndex: 100, overflow: "hidden",
                }}>
                    {/* Header */}
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Notifications</span>
                        {notifications.some(n => !n.read) && (
                            <button onClick={handleMarkAll} className="btn-reset"
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#2563EB", fontWeight: 600, padding: 0 }}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: 340, overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <p style={{ textAlign: "center", padding: "24px 0", color: "#9CA3AF", fontSize: 13 }}>No notifications</p>
                        ) : notifications.map(n => (
                            <div key={n.id} style={{
                                padding: "12px 16px",
                                borderBottom: "1px solid #F9FAFB",
                                background: n.read ? "#fff" : "#EFF6FF",
                                display: "flex", flexDirection: "column", gap: 6,
                            }}>
                                <p style={{ margin: 0, fontSize: 13, color: "#111827", lineHeight: 1.4 }}>{n.message}</p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                                        {new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {!n.read && (
                                        <button onClick={() => handleMarkRead(n.id)} className="btn-reset"
                                            style={{ background: "none", border: "1px solid #BFDBFE", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "#2563EB", cursor: "pointer", fontWeight: 600 }}>
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

const navItems = [
    { name: "Dashboard",        path: "/patient",                icon: LayoutDashboard },
    { name: "Find Doctors",     path: "/patient/doctors",        icon: Users },
    { name: "Book Appointment", path: "/patient/new-appointment",icon: CalendarPlus },
    { name: "My Appointments",  path: "/patient/appointments",   icon: CalendarCheck },
    { name: "Prescriptions",    path: "/patient/medicine",       icon: FileText },
    { name: "Profile Settings", path: "/patient/profile",        icon: Settings },
];

/* ─────────────────────────────────────────────
   DASHBOARD HOME
───────────────────────────────────────────── */
const DashboardHome = () => {
    const { list: appointments } = useAppSelector(s => s.appointments);
    const { currentPatient: profile } = useAppSelector(s => s.patients);
    const userEmail = getUserEmail();

    const upcoming = appointments
        ?.filter(a => new Date(a.appointmentDate) > new Date())
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    const next = upcoming?.[0];

    const stats = [
        {
            label: "Next Appointment",
            value: next ? new Date(next.appointmentDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}) : "None",
            sub: next ? `Dr. ${next.doctorFirstName} ${next.doctorLastName}` : "No upcoming",
            color: "#2563EB",
            bg: "#EFF6FF",
            icon: <CalendarCheck size={20} color="#2563EB" />,
        },
        {
            label: "Upcoming",
            value: upcoming?.length ?? 0,
            sub: "Scheduled visits",
            color: "#059669",
            bg: "#ECFDF5",
            icon: <CalendarPlus size={20} color="#059669" />,
        },
        {
            label: "Total Appointments",
            value: appointments?.length ?? 0,
            sub: "All time",
            color: "#7C3AED",
            bg: "#F5F3FF",
            icon: <FileText size={20} color="#7C3AED" />,
        },
    ];

    const quickActions = [
        { label: "Find Doctors",     sub: "Browse specialists",  path: "/patient/doctors",         color: "#2563EB", Icon: Users },
        { label: "Book Appointment", sub: "Schedule a visit",    path: "/patient/new-appointment",  color: "#059669", Icon: CalendarPlus },
        { label: "Prescriptions",    sub: "View medications",    path: "/patient/medicine",          color: "#7C3AED", Icon: FileText },
        { label: "Profile Settings", sub: "Manage your account", path: "/patient/profile",           color: "#D97706", Icon: Settings },
    ];

    const displayName = profile
        ? `${profile.firstName} ${profile.lastName}`
        : userEmail || "Patient";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Welcome banner */}
            <div style={{
                background: "linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)",
                borderRadius: 12, padding: "28px 32px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: "0 4px 24px rgba(37,99,235,0.25)",
            }}>
                <div>
                    <p style={{ color: "#BFDBFE", fontSize: 13, fontWeight: 500, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Welcome back
                    </p>
                    <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: "0 0 4px" }}>{displayName}</h2>
                    <p style={{ color: "#93C5FD", fontSize: 13 }}>Patient ID: P{profile?.id || "----"}</p>
                </div>
                <img
                    src={getProfilePictureFromLocal('patient') || "defaultpfp"}
                    alt="avatar"
                    style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", border: "3px solid rgba(255,255,255,0.3)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                />
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                {stats.map(s => (
                    <div key={s.label} style={{
                        background: "#fff", borderRadius: 10, padding: "20px 22px",
                        border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        display: "flex", alignItems: "flex-start", gap: 14,
                    }}>
                        <div style={{ background: s.bg, borderRadius: 8, padding: 10, flexShrink: 0 }}>{s.icon}</div>
                        <div>
                            <p style={{ color: "#6B7280", fontSize: 12, fontWeight: 600, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</p>
                            <p style={{ color: "#111827", fontSize: 24, fontWeight: 700, lineHeight: 1.1 }}>{s.value}</p>
                            <p style={{ color: "#9CA3AF", fontSize: 12, marginTop: 2 }}>{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div>
                <p style={{ color: "#374151", fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Quick Actions</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                    {quickActions.map(({ label, sub, path, color, Icon }) => (
                        <Link key={path} to={path} style={{ textDecoration: "none" }}>
                            <div style={{
                                background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10,
                                padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
                                cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                <div style={{ background: color + "18", borderRadius: 8, padding: 10, flexShrink: 0 }}>
                                    <Icon size={18} color={color} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: "#111827", fontSize: 14, fontWeight: 700, margin: 0 }}>{label}</p>
                                    <p style={{ color: "#9CA3AF", fontSize: 12, margin: 0 }}>{sub}</p>
                                </div>
                                <ChevronRight size={16} color="#D1D5DB" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   PRESCRIPTIONS PAGE (inline, styled cleanly)
───────────────────────────────────────────── */
const PrescriptionsPage = ({ prescriptions, patientProfile, userEmail }) => (
    <div>
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>My Prescriptions</h2>
            <p style={{ color: "#6B7280", fontSize: 14, margin: "4px 0 0" }}>View and manage your prescribed medications</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            {prescriptions.length > 0 ? prescriptions.map((rx, i) => (
                <div key={rx.id} style={{
                    padding: "20px 24px",
                    borderBottom: i < prescriptions.length - 1 ? "1px solid #F3F4F6" : "none",
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <div>
                            <p style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>Prescription #{rx.id}</p>
                            <p style={{ color: "#7C3AED", fontSize: 13, marginTop: 2 }}>Appointment #{rx.appointmentId}</p>
                        </div>
                        <span style={{ background: "#ECFDF5", color: "#065F46", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>Active</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                        {[["Medication Details", rx.medicationDetails], ["Dosage Instructions", rx.dosages]].map(([label, val]) => (
                            <div key={label} style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 14px" }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                                <p style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>{val}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => alert('Payment Successful! ✅')}
                            style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                            Pay Now
                        </button>
                        <button onClick={() => {
                            const w = window.open('', '_blank');
                            w.document.write(`<html><body style="font-family:Arial;padding:32px"><h2>Prescription Report</h2><p><b>Patient:</b> ${patientProfile ? `${patientProfile.firstName} ${patientProfile.lastName}` : userEmail}</p><p><b>Prescription:</b> #${rx.id}</p><p><b>Medication:</b> ${rx.medicationDetails}</p><p><b>Dosage:</b> ${rx.dosages}</p></body></html>`);
                            w.document.close(); w.print();
                        }}
                            style={{ background: "#fff", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Print
                        </button>
                    </div>
                </div>
            )) : (
                <div style={{ textAlign: "center", padding: "56px 24px", color: "#9CA3AF" }}>
                    <FileText size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                    <p style={{ fontWeight: 600, color: "#374151", fontSize: 16 }}>No prescriptions found</p>
                    <p style={{ fontSize: 14, marginTop: 4 }}>Your prescribed medications will appear here</p>
                </div>
            )}
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   PATIENT DASHBOARD (main shell)
───────────────────────────────────────────── */
const PatientDashboard = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const dispatch  = useAppDispatch();
    const userEmail = getUserEmail();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [error, setError] = useState(null);

    const { loading }                    = useAppSelector(s => s.appointments);
    const { list: prescriptions }        = useAppSelector(s => s.prescriptions);
    const { currentPatient: profile }    = useAppSelector(s => s.patients);

    const handleLogout = useCallback(() => { removeToken(); navigate("/login"); }, [navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch(setLoading(true));
                const [apt, rx, prof] = await Promise.all([
                    getMyAppointments().catch(() => ({ data: [] })),
                    getMyPrescriptions().catch(() => ({ data: [] })),
                    getMyProfile().catch(() => ({ data: null })),
                ]);
                dispatch(setAppointments(apt.data || []));
                dispatch(setPrescriptions(rx.data || []));
                dispatch(setCurrentPatient(prof.data));
                setError(null);
            } catch (err) {
                dispatch(setAppointments([]));
                dispatch(setPrescriptions([]));
                dispatch(setCurrentPatient(null));
                if (err.response?.status === 401 || err.response?.status === 403) handleLogout();
                else setError("Some data could not be loaded. Please check your connection.");
            } finally {
                dispatch(setLoading(false));
            }
        };
        fetchData();
    }, [dispatch, handleLogout]);

    const displayName = profile ? `${profile.firstName} ${profile.lastName}` : userEmail || "Patient";
    const activePath  = location.pathname === "/patient" ? "/patient" : navItems.find(n => location.pathname.startsWith(n.path) && n.path !== "/patient")?.path ?? "/patient";

    /* ── Page title map ── */
    const pageTitle = navItems.find(n => n.path === activePath)?.name ?? "Dashboard";

    return (
        <div style={{ display: "flex", height: "100vh", background: "#F3F4F6", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 40 }}
                    onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* ── SIDEBAR ── */}
            <aside style={{
                position: "fixed", inset: "0 auto 0 0", width: 230, zIndex: 50,
                background: "#fff", borderRight: "1px solid #E5E7EB",
                display: "flex", flexDirection: "column",
                transform: isSidebarOpen ? "translateX(0)" : undefined,
                transition: "transform 0.25s ease",
                boxShadow: "2px 0 12px rgba(0,0,0,0.06)",
            }}
                className="md-sidebar"
            >
                {/* Logo */}
                <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #F3F4F6" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: "#2563EB", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <img src={logo} alt="logo" style={{ width: 22, height: 22 }} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 800, fontSize: 15, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>HealthCare</p>
                            <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>Patient Portal</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "14px 12px", overflowY: "auto" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>Navigation</p>
                    {navItems.map(({ name, path, icon: Icon }) => {
                        const isActive = activePath === path;
                        return (
                            <Link key={path} to={path} onClick={() => setIsSidebarOpen(false)}
                                style={{ textDecoration: "none", display: "block", marginBottom: 2 }}>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "9px 10px", borderRadius: 8,
                                    background: isActive ? "#EFF6FF" : "transparent",
                                    color: isActive ? "#2563EB" : "#374151",
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: 14,
                                    transition: "background 0.15s",
                                    borderLeft: isActive ? "3px solid #2563EB" : "3px solid transparent",
                                }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#F9FAFB"; }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                                >
                                    <Icon size={17} />
                                    {name}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div style={{ padding: "14px 16px", borderTop: "1px solid #F3F4F6" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <img
                            src={getProfilePictureFromLocal('patient') || "https://i.pravatar.cc/40?img=5"}
                            alt="avatar"
                            style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", border: "1.5px solid #E5E7EB" }}
                        />
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                            <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>P{profile?.id || "----"}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-reset"
                        style={{
                            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                            background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA",
                            borderRadius: 8, padding: "8px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.borderColor = "#F87171"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#FECACA"; }}
                    >
                        <LogOut size={15} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <main style={{ flex: 1, marginLeft: 230, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
                {/* Top header */}
                <header style={{
                    background: "#fff", borderBottom: "1px solid #E5E7EB",
                    padding: "0 28px", height: 60,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    position: "sticky", top: 0, zIndex: 20,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <button style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }}
                            className="hamburger"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <div>
                            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>{pageTitle}</h1>
                            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <NotificationBell />
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <img
                                src={getProfilePictureFromLocal('patient') || "https://i.pravatar.cc/36?img=5"}
                                alt="avatar"
                                style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover", border: "1.5px solid #E5E7EB" }}
                            />
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{displayName}</p>
                                <p style={{ fontSize: 11, color: "#2563EB", margin: 0, fontWeight: 500 }}>Patient</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div style={{ flex: 1, padding: "24px 28px" }}>
                    <Routes>
                        <Route index element={
                            loading
                                ? <div style={{ textAlign: "center", padding: 60, color: "#6B7280" }}>Loading...</div>
                                : error
                                    ? <div style={{ textAlign: "center", padding: 60, color: "#DC2626" }}>{error}</div>
                                    : <DashboardHome />
                        } />
                        <Route path="doctors"         element={<DoctorsList />} />
                        <Route path="new-appointment" element={<NewAppointment />} />
                        <Route path="appointments"    element={<AppointmentHistory />} />
                        <Route path="medicine"        element={
                            <PrescriptionsPage
                                prescriptions={prescriptions}
                                patientProfile={profile}
                                userEmail={userEmail}
                            />
                        } />
                        <Route path="profile"         element={
                            <ProfileSettings
                                userType="patient"
                                userProfile={profile}
                                onProfileUpdate={async (updated) => {
                                    dispatch(setCurrentPatient({ ...profile, ...updated }));
                                }}
                            />
                        } />
                    </Routes>
                </div>
            </main>

            {/* Responsive: hide sidebar on mobile, show hamburger */}
            <style>{`
                @media (max-width: 768px) {
                    .md-sidebar { transform: translateX(-100%); }
                    .md-sidebar.open { transform: translateX(0); }
                    main { margin-left: 0 !important; }
                    .hamburger { display: flex !important; }
                }
                .btn-reset {
                    background-color: transparent !important;
                    background: none !important;
                }
            `}</style>
        </div>
    );
};

export default PatientDashboard;