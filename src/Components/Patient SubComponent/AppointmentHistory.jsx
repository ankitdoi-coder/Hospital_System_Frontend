import React, { useState, useEffect } from 'react';
import { getMyAppointments, makePayment, cancelAppointment, createRazorpayOrder, verifyRazorpayPayment } from '../../Services/PatientService.js';
import { setupAxiosInterceptors } from '../../Services/AuthService.js';

const FILTERS = ['all', 'upcoming', 'past', 'pending', 'scheduled', 'completed', 'canceled'];

const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    scheduled: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    canceled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    default: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

const AppointmentHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAppointment, setPaymentAppointment] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(null);

    useEffect(() => {
        setupAxiosInterceptors();
        const fetchAppointments = async () => {
            try {
                const response = await getMyAppointments();
                setAppointments(response.data);
            } catch (error) {
                console.error('Failed to fetch appointments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const filteredAppointments = appointments.filter(appointment => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') return new Date(appointment.appointmentDate) > new Date();
        if (filter === 'past') return new Date(appointment.appointmentDate) < new Date();
        return appointment.status?.toLowerCase() === filter.toLowerCase();
    });

    const getStatusStyle = (status) => STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.default;

    const openPaymentModal = (appointment) => {
        setPaymentAppointment(appointment);
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        if (paymentLoading) return;
        setShowPaymentModal(false);
        setPaymentAppointment(null);
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            setCancelLoading(appointmentId);
            await cancelAppointment(appointmentId);
            setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
            alert('Failed to cancel appointment. Please try again.');
        } finally {
            setCancelLoading(null);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async (appointment) => {
        try {
            setPaymentLoading(appointment.id);
            const amount = appointment.amount || 500;
            const res = await createRazorpayOrder(appointment.id, amount);
            const data = res.data;

            await loadRazorpayScript();

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: 'HealthCare System',
                description: `Payment for Appointment #${appointment.id}`,
                order_id: data.id,
                handler: async function (response) {
                    try {
                        await verifyRazorpayPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            appointmentId: String(appointment.id)
                        });
                        setAppointments(prev => prev.map(apt => apt.id === appointment.id ? { ...apt, billingStatus: 'PAID' } : apt));
                        setShowPaymentModal(false);
                        setPaymentAppointment(null);
                    } catch (err) {
                        console.error('Payment verification failed', err);
                        alert('Payment verification failed. Please contact support.');
                    } finally {
                        setPaymentLoading(null);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setPaymentLoading(null);
                    }
                },
                prefill: {
                    email: appointment.patientEmail || undefined
                },
                theme: { color: '#7c3aed' }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function () {
                alert('Payment failed. Please try again.');
                setPaymentLoading(null);
            });
            rzp.open();
        } catch (error) {
            console.error('Razorpay payment failed', error);
            alert('Payment could not be initiated. Please try again.');
            setPaymentLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-purple-600 mb-4"></div>
                    <div className="text-slate-500 text-sm font-medium">Loading appointments…</div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>My Appointments</span>
                </h2>
                <p className="text-purple-100 mt-2">View and manage your appointment history</p>
            </div>

            {/* Filter Buttons */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 mb-8">
                <div className="flex flex-wrap gap-3">
                    {FILTERS.map(filterOption => (
                        <button
                            key={filterOption}
                            onClick={() => setFilter(filterOption)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                filter === filterOption
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                            }`}
                        >
                            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-purple-50">
                    <h3 className="text-2xl font-bold text-gray-900">
                        Appointments ({filteredAppointments.length})
                    </h3>
                </div>

                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-16">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h4>
                        <p className="text-gray-500">No appointments match the selected filter.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-purple-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Specialty</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date &amp; Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAppointments.map(appointment => {
                                    const isPaid = appointment.billingStatus === 'PAID';
                                    const isProcessing = paymentLoading === appointment.id;
                                    const isCancelable = appointment.status === 'PENDING' || appointment.status === 'SCHEDULED';

                                    return (
                                        <tr key={appointment.id} className="hover:bg-purple-50/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">
                                                            Dr. {appointment.doctorFirstName} {appointment.doctorLastName}
                                                        </div>
                                                        <div className="text-xs text-gray-400">ID #{appointment.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {appointment.doctorSpecialty}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="font-medium">{new Date(appointment.appointmentDate).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500">{new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(appointment.status)}`}>
                                                    {appointment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        isPaid ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                        {isPaid ? 'Paid' : 'Unpaid'}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-900">₹{appointment.amount || 500}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => { setSelectedAppointment(appointment); setShowModal(true); }}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                                    >
                                                        Details
                                                    </button>

                                                    {!isPaid && (
                                                        <button
                                                            onClick={() => openPaymentModal(appointment)}
                                                            disabled={isProcessing}
                                                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isProcessing ? 'Processing…' : 'Pay Now'}
                                                        </button>
                                                    )}

                                                    {isCancelable && (
                                                        <button
                                                            onClick={() => handleCancelAppointment(appointment.id)}
                                                            disabled={cancelLoading === appointment.id}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-50"
                                                        >
                                                            {cancelLoading === appointment.id ? 'Cancelling…' : 'Cancel'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Appointment Details Modal */}
            {showModal && selectedAppointment && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Appointment Details</h3>
                            <p className="text-gray-400 text-sm">#{selectedAppointment.id}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Doctor</p>
                                <p className="text-gray-900 font-medium">Dr. {selectedAppointment.doctorFirstName} {selectedAppointment.doctorLastName}</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Specialty</p>
                                <p className="text-gray-900 font-medium">{selectedAppointment.doctorSpecialty}</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date &amp; Time</p>
                                <p className="text-gray-900 font-medium">{new Date(selectedAppointment.appointmentDate).toLocaleString()}</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(selectedAppointment.status)}`}>
                                        {selectedAppointment.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Amount</p>
                                    <p className="text-gray-900 font-bold">₹{selectedAppointment.amount || 500}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-colors font-semibold text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && paymentAppointment && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        {/* Modal header */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 relative">
                            <button
                                onClick={closePaymentModal}
                                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                                aria-label="Close"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <p className="text-purple-100 text-xs font-semibold uppercase tracking-wide mb-1">Complete Payment</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">₹{paymentAppointment.amount || 500}</span>
                                <span className="text-purple-100 text-sm">for Appointment #{paymentAppointment.id}</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Real payment gateway — handles UPI, cards & netbanking */}
                            <button
                                onClick={() => handleRazorpayPayment(paymentAppointment)}
                                disabled={paymentLoading === paymentAppointment.id}
                                className="w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 border-purple-200 bg-purple-50/60 hover:bg-purple-50 hover:border-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                                        {paymentLoading === paymentAppointment.id ? (
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={2} />
                                                <path strokeLinecap="round" strokeWidth={2} d="M2 10h20" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {paymentLoading === paymentAppointment.id ? 'Opening secure checkout…' : 'Pay with UPI, Card or Netbanking'}
                                        </div>
                                        <div className="text-xs text-gray-500">Powered by Razorpay · verified &amp; encrypted</div>
                                    </div>
                                </div>
                                {paymentLoading !== paymentAppointment.id && (
                                    <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>

                            {/* Supported methods */}
                            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
                                <span>UPI</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span>Visa / Mastercard / Rupay</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span>Netbanking</span>
                            </div>

                            <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Every payment is verified server-side before your appointment is marked paid
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AppointmentHistory;