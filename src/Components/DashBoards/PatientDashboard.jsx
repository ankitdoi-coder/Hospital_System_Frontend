import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { LogOut, Menu, X, LayoutDashboard, Users, CalendarPlus, CalendarCheck, FileText, Settings, Bell, ChevronRight } from "lucide-react";
import { removeToken, getUserEmail } from "../../Services/AuthService.js";
import { getMyAppointments, getMyPrescriptions, getMyProfile, getMyNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from "../../Services/PatientService.js";
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

    useEffect(() => {
        const fetchCount = async () => {
            try { const res = await getUnreadCount(); setUnreadCount(res.data); } catch { }
        };
        fetchCount();
        window.addEventListener("focus", fetchCount);
        return () => window.removeEventListener("focus", fetchCount);
    }, []);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
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
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Notifications</span>
                        {notifications.some(n => !n.read) && (
                            <button onClick={handleMarkAll} className="btn-reset"
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#2563EB", fontWeight: 600, padding: 0 }}>
                                Mark all as read
                            </button>
                        )}
                    </div>

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
    { name: "Dashboard", path: "/patient", icon: LayoutDashboard },
    { name: "Find Doctors", path: "/patient/doctors", icon: Users },
    { name: "Book Appointment", path: "/patient/new-appointment", icon: CalendarPlus },
    { name: "My Appointments", path: "/patient/appointments", icon: CalendarCheck },
    { name: "Prescriptions", path: "/patient/medicine", icon: FileText },
    { name: "Profile Settings", path: "/patient/profile", icon: Settings },
];

/* ─────────────────────────────────────────────
   DASHBOARD HOME
   Fetches its own slice of data (no Redux). Uses `totalElements`
   from the paginated response for the "Total Appointments" stat,
   not the length of whatever single page happened to load —
   otherwise the count silently caps at the page size (10).
───────────────────────────────────────────── */
const DashboardHome = () => {
    const userEmail = getUserEmail();
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [totalAppointments, setTotalAppointments] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [apt, prof] = await Promise.all([
                    getMyAppointments(0, 100),
                    getMyProfile(),
                ]);
                if (cancelled) return;
                // Handle both shapes: a paginated Page object ({content, totalElements})
                // or a plain array (if that endpoint isn't paginated on your backend yet).
                const aptList = Array.isArray(apt) ? apt : (apt.content || []);
                const aptTotal = Array.isArray(apt) ? apt.length : (apt.totalElements ?? aptList.length);
                setAppointments(aptList);
                setTotalAppointments(aptTotal);
                setProfile(prof.data); // getMyProfile() is a raw axios response — use .data, not prof itself
                setError(null);
            } catch (err) {
                if (cancelled) return;
                setAppointments([]);
                setTotalAppointments(0);
                setProfile(null);
                setError("Some data could not be loaded. Please check your connection.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchData();
        return () => { cancelled = true; };
    }, []);

    if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#6B7280" }}>Loading...</div>;
    if (error) return <div style={{ textAlign: "center", padding: 60, color: "#DC2626" }}>{error}</div>;

    const upcoming = appointments
        .filter(a => new Date(a.appointmentDate) > new Date())
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    const next = upcoming[0];

    const stats = [
        {
            label: "Next Appointment",
            value: next ? new Date(next.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "None",
            sub: next ? `Dr. ${next.doctorFirstName} ${next.doctorLastName}` : "No upcoming",
            color: "#2563EB",
            bg: "#EFF6FF",
            icon: <CalendarCheck size={20} color="#2563EB" />,
        },
        {
            label: "Upcoming",
            value: upcoming.length,
            sub: "Scheduled visits",
            color: "#059669",
            bg: "#ECFDF5",
            icon: <CalendarPlus size={20} color="#059669" />,
        },
        {
            label: "Total Appointments",
            value: totalAppointments,
            sub: "All time",
            color: "#7C3AED",
            bg: "#F5F3FF",
            icon: <FileText size={20} color="#7C3AED" />,
        },
    ];

    const quickActions = [
        { label: "Find Doctors", sub: "Browse specialists", path: "/patient/doctors", color: "#2563EB", Icon: Users },
        { label: "Book Appointment", sub: "Schedule a visit", path: "/patient/new-appointment", color: "#059669", Icon: CalendarPlus },
        { label: "Prescriptions", sub: "View medications", path: "/patient/medicine", color: "#7C3AED", Icon: FileText },
        { label: "Profile Settings", sub: "Manage your account", path: "/patient/profile", color: "#D97706", Icon: Settings },
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
                    src={profile?.profilePicture || defaultpfp}
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
   PRESCRIPTIONS PAGE
   Now fetches its own data locally instead of receiving it
   as props from a Redux-connected parent.
───────────────────────────────────────────── */
const PrescriptionsPage = () => {
    const userEmail = getUserEmail();
    const [prescriptions, setPrescriptions] = useState([]);
    const [patientProfile, setPatientProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [rx, prof] = await Promise.all([
                    getMyPrescriptions(0, 100),
                    getMyProfile(),
                ]);
                if (cancelled) return;
                setPrescriptions(rx.content || []);
                setPatientProfile(prof);
            } catch (err) {
                if (cancelled) return;
                setPrescriptions([]);
                setPatientProfile(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchData();
        return () => { cancelled = true; };
    }, []);

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>My Prescriptions</h2>
                <p style={{ color: "#6B7280", fontSize: 14, margin: "4px 0 0" }}>View and manage your prescribed medications</p>
            </div>

            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "56px 24px", color: "#9CA3AF" }}>Loading...</div>
                ) : prescriptions.length > 0 ? prescriptions.map((rx, i) => (
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
                            <button onClick={() => {
                                const w = window.open('', '_blank');
                                const patientName = patientProfile ? `${patientProfile.firstName} ${patientProfile.lastName}` : userEmail;
                                const doctorName = (rx.doctorFirstName && rx.doctorLastName) ? `Dr. ${rx.doctorFirstName} ${rx.doctorLastName}` : 'Attending Physician';
                                const issueDate = rx.createdAt ? new Date(rx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
                                const medications = rx.medicationDetails.split(',').map(m => m.trim()).filter(Boolean);
                                const dosages = rx.dosages.split(',').map(d => d.trim()).filter(Boolean);

                                w.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Prescription #${rx.id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #e2e8f0; display: flex; justify-content: center; padding: 40px 20px; color: #0f172a; }
        .slip { background: #fff; width: 210mm; min-height: 297mm; padding: 40px 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); position: relative; }
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
        .footer { margin-top: auto; padding-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
        .instructions { max-width: 60%; font-size: 11px; color: #64748b; line-height: 1.5; border-left: 3px solid #cbd5e1; padding-left: 12px; }
        .signature-block { text-align: center; width: 220px; }
        .signature-line { border-bottom: 1px solid #0f172a; margin-bottom: 8px; height: 40px; }
        .signature-block p { font-size: 12px; font-weight: 600; color: #0f172a; }
        .signature-block span { font-size: 10px; color: #64748b; }
        @media print { body { background: #fff; padding: 0; } .slip { box-shadow: none; width: 100%; min-height: auto; padding: 0; } @page { margin: 15mm; } }
    </style>
</head>
<body>
    <div class='slip'>
        <div class='header'>
            <div class='clinic-brand'>
                <h1>HealthCare Center</h1>
                <p>Advanced Medical Services</p>
            </div>
            <div class='meta-info'>
                <p><strong>Record No:</strong> #${rx.id}</p>
                <p><strong>Date:</strong> ${issueDate}</p>
            </div>
        </div>
        <div class='doctor-info'>
            <h2>${doctorName}</h2>
            <p>MBBS, MD - General Medicine</p>
        </div>
        <div class='patient-grid'>
            <div class='data-group'><label>Patient Name</label><p>${patientName}</p></div>
            <div class='data-group'><label>Patient ID</label><p>P-${rx.patientId || 'N/A'}</p></div>
            <div class='data-group'><label>Appointment Ref</label><p>#${rx.appointmentId}</p></div>
            <div class='data-group'><label>Valid Until</label><p>30 Days from Issue</p></div>
        </div>
        <div class='rx-symbol'>&#8478;</div>
        <div class='med-section'>
            <h3>Prescription Details</h3>
            <table class='med-table'>
                <thead><tr><th>#</th><th>Medication</th><th>Dosage & Instructions</th></tr></thead>
                <tbody>
                    ${medications.map((med, idx) => `
                    <tr>
                        <td>0${idx + 1}</td>
                        <td><span class="med-name">${med}</span></td>
                        <td>${dosages[idx] || dosages[0] || 'Take as directed by physician'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class='footer'>
            <div class='instructions'><strong>Important:</strong> Substitute with generic equivalents if required, unless specified otherwise. Keep all medicines out of reach of children.</div>
            <div class='signature-block'>
                <div class='signature-line'></div>
                <p>${doctorName}</p>
                <span>Authorized Signature & Stamp</span>
            </div>
        </div>
    </div>
    <script>window.onload = () => setTimeout(() => window.print(), 150);</script>
</body>
</html>
`);
                                w.document.close();
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
};

/* ─────────────────────────────────────────────
   PATIENT DASHBOARD (main shell)
   Only owns "profile" for the sidebar/header avatar + name.
   Each page (DashboardHome, PrescriptionsPage, DoctorsList,
   AppointmentHistory) fetches whatever data it needs itself.
───────────────────────────────────────────── */
const PatientDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userEmail = getUserEmail();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [profile, setProfile] = useState(null);

    const handleLogout = useCallback(() => { removeToken(); navigate("/login"); }, [navigate]);

    useEffect(() => {
        let cancelled = false;
        const fetchProfile = async () => {
            try {
                const prof = await getMyProfile();
                if (!cancelled) setProfile(prof);
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 403) handleLogout();
            }
        };
        fetchProfile();
        return () => { cancelled = true; };
    }, [handleLogout]);

    const displayName = profile ? `${profile.firstName} ${profile.lastName}` : userEmail || "Patient";
    const activePath = location.pathname === "/patient" ? "/patient" : navItems.find(n => location.pathname.startsWith(n.path) && n.path !== "/patient")?.path ?? "/patient";
    const pageTitle = navItems.find(n => n.path === activePath)?.name ?? "Dashboard";

    return (
        <div style={{ display: "flex", height: "100vh", background: "#F3F4F6", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

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

                <div style={{ padding: "14px 16px", borderTop: "1px solid #F3F4F6" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <img
                            src={profile?.profilePicture || defaultpfp}
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
                                src={profile?.profilePicture || defaultpfp}
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

                <div style={{ flex: 1, padding: "24px 28px" }}>
                    <Routes>
                        <Route index element={<DashboardHome />} />
                        <Route path="doctors" element={<DoctorsList />} />
                        <Route path="new-appointment" element={<NewAppointment />} />
                        <Route path="appointments" element={<AppointmentHistory />} />
                        <Route path="medicine" element={<PrescriptionsPage />} />
                        <Route path="profile" element={
                            <ProfileSettings
                                userType="patient"
                                userProfile={profile}
                                onProfileUpdate={async (updated) => {
                                    setProfile(prev => ({ ...prev, ...updated }));
                                }}
                            />
                        } />
                    </Routes>
                </div>
            </main>

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