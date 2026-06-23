import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import Logo from "../../assets/OnlyLogo.png";
import BackgroundImage from "../../assets/BG4.jpg";

import { RegisterUser, sendOtp, verifyOtp } from "../../Services/AuthService.js";

/*
  FLOW:
  Step 1 — User fills the full registration form and clicks "Send OTP"
            → calls POST /api/auth/send-otp with the email
            → backend generates a 6-digit OTP and emails it

  Step 2 — OTP input screen appears (6 individual boxes)
            → user enters the code received in email
            → calls POST /api/auth/verify-otp with email + otp
            → backend checks: OTP match, not expired (10 min), not already used

  Step 3 — On successful OTP verification
            → calls POST /api/auth/register with all the form data
            → redirects to /login on success
*/

const Register = () => {
    const {
        register,
        handleSubmit,
        watch,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            firstName: '', lastName: '', role: '',
            dob: '', contactNumber: '', specialty: '',
            email: '', password: '', experience: ''
        }
    });

    const selectedRole = watch('role');
    const Navigator = useNavigate();

    // step: 'form' | 'otp'
    const [step, setStep] = useState('form');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef([]);

    // ── Step 1: validate form then send OTP ──────────────────
    const onSubmit = async (data) => {
        setSendingOtp(true);
        try {
            await sendOtp(data.email);
            toast.success(`OTP sent to ${data.email}`, { position: 'top-center' });
            setStep('otp');
            startResendCooldown();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP. Try again.', { position: 'top-center' });
        } finally {
            setSendingOtp(false);
        }
    };

    // ── Step 2: verify OTP then register ─────────────────────
    const handleVerifyAndRegister = async () => {
        const otp = otpDigits.join('');
        if (otp.length < 6) {
            toast.error('Please enter the complete 6-digit OTP.', { position: 'top-center' });
            return;
        }

        const email = getValues('email');
        setVerifying(true);
        try {
            // Verify OTP with backend
            await verifyOtp(email, otp);
            toast.success('Email verified!', { position: 'top-center' });

            // Now register
            const data = getValues();
            const roleIdMap = { patient: 1, doctor: 2 };
            await RegisterUser({ ...data, roleId: roleIdMap[data.role] });

            toast.success('Registration successful! Redirecting to login...', { duration: 3000, position: 'top-center' });
            setTimeout(() => Navigator('/login'), 1500);

        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired OTP.', { position: 'top-center' });
        } finally {
            setVerifying(false);
        }
    };

    // ── Resend OTP ────────────────────────────────────────────
    const handleResend = async () => {
        if (resendCooldown > 0) return;
        const email = getValues('email');
        try {
            await sendOtp(email);
            toast.success('New OTP sent!', { position: 'top-center' });
            setOtpDigits(['', '', '', '', '', '']);
            startResendCooldown();
        } catch {
            toast.error('Failed to resend OTP.', { position: 'top-center' });
        }
    };

    const startResendCooldown = () => {
        setResendCooldown(30);
        const t = setInterval(() => {
            setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
        }, 1000);
    };

    // ── OTP box key handling ──────────────────────────────────
    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return; // only digits
        const updated = [...otpDigits];
        updated[index] = value;
        setOtpDigits(updated);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0)
            inputRefs.current[index - 1]?.focus();
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtpDigits(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center flex justify-center items-center p-4"
            style={{ backgroundImage: `url(${BackgroundImage})` }}
        >
            <Toaster />
            <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg p-8 max-w-md w-full">
                <div className="flex flex-col items-center mb-8">
                    <img src={Logo} alt="Logo" className="w-20 h-auto mb-4 mt-4" />
                    <h2 className="text-3xl font-bold text-gray-800">
                        {step === 'form' ? 'Member Registration' : 'Verify Your Email'}
                    </h2>
                    {step === 'otp' && (
                        <p className="text-sm text-gray-600 mt-2 text-center">
                            We sent a 6-digit code to <span className="font-semibold">{getValues('email')}</span>
                        </p>
                    )}
                </div>

                {/* ══ STEP 1: REGISTRATION FORM ══ */}
                {step === 'form' && (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* First + Last Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
                            <div className="relative mb-6">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                </div>
                                <input {...register("firstName", { required: "⚠️First Name is required", minLength: { value: 2, message: "⚠️Min 2 characters" }, maxLength: { value: 10, message: "⚠️Max 10 characters" } })}
                                    className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500"
                                    placeholder="First Name" type="text" />
                                {errors.firstName && <div className="text-red-500 text-sm mt-1">{errors.firstName.message}</div>}
                            </div>
                            <div className="relative mb-6">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                </div>
                                <input {...register("lastName", { required: "⚠️Last Name is required", minLength: { value: 2, message: "⚠️Min 2 characters" }, maxLength: { value: 20, message: "⚠️Max 20 characters" } })}
                                    className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500"
                                    placeholder="Last Name" type="text" />
                                {errors.lastName && <div className="text-red-500 text-sm mt-1">{errors.lastName.message}</div>}
                            </div>
                        </div>

                        {/* Role */}
                        <div className="relative mb-6">
                            <select {...register("role", { required: "⚠️Please select a role" })}
                                className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3">
                                <option value="">Select a role</option>
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                            </select>
                            {errors.role && <div className="text-red-500 text-sm mt-1">{errors.role.message}</div>}
                        </div>

                        {/* Patient fields */}
                        {selectedRole === 'patient' && (
                            <>
                                <div className="relative mb-6">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                                    </div>
                                    <input type="date" {...register("dob", { required: "⚠️Date of Birth is required", validate: v => new Date(v) < new Date() || "⚠️Must be in the past" })}
                                        className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3" />
                                    {errors.dob && <div className="text-red-500 text-sm mt-1">{errors.dob.message}</div>}
                                </div>
                                <div className="relative mb-6">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                    </div>
                                    <input type="tel" {...register("contactNumber", { required: "⚠️Contact Number is required", pattern: { value: /^[0-9]{10}$/, message: "⚠️Must be 10 digits" } })}
                                        className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500"
                                        placeholder="Contact Number" />
                                    {errors.contactNumber && <div className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</div>}
                                </div>
                            </>
                        )}

                        {/* Doctor fields */}
                        {selectedRole === 'doctor' && (
                            <>
                                <div className="relative mb-6">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM4 11a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zM4 15a1 1 0 011-1h2a1 1 0 110 2H5a1 1 0 01-1-1z" /></svg>
                                    </div>
                                    <input type="text" {...register("specialty", { required: "⚠️Specialty is required", minLength: { value: 3, message: "⚠️Min 3 characters" } })}
                                        className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500"
                                        placeholder="Specialty (e.g., Cardiology)" />
                                    {errors.specialty && <div className="text-red-500 text-sm mt-1">{errors.specialty.message}</div>}
                                </div>
                                <div className="relative mb-6">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM4 11a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zM4 15a1 1 0 011-1h2a1 1 0 110 2H5a1 1 0 01-1-1z" /></svg>
                                    </div>
                                    <input type="number" {...register("experience", { required: "⚠️Experience is required", min: { value: 0, message: "⚠️Must be positive" } })}
                                        className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500"
                                        placeholder="Years of Experience" />
                                    {errors.experience && <div className="text-red-500 text-sm mt-1">{errors.experience.message}</div>}
                                </div>
                            </>
                        )}

                        {/* Email */}
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                            </div>
                            <input type="email" {...register("email", { required: "⚠️Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "⚠️Invalid email address" } })}
                                className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500"
                                placeholder="Email Address" />
                            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email.message}</div>}
                        </div>

                        {/* Password */}
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            </div>
                            <input type="password" {...register("password", { required: "⚠️Password is required", minLength: { value: 8, message: "⚠️Min 8 characters" }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: "⚠️Must contain uppercase, lowercase, and number" } })}
                                className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500"
                                placeholder="Password" />
                            {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password.message}</div>}
                        </div>

                        <button type="submit" disabled={isSubmitting || sendingOtp}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-md px-5 py-3 text-center transition duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed">
                            {sendingOtp ? 'Sending OTP...' : 'Send OTP & Continue'}
                        </button>

                        <p className="text-sm font-medium text-center text-gray-700 mt-6">
                            Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-bold">Login Here</Link>
                        </p>
                    </form>
                )}

                {/* ══ STEP 2: OTP VERIFICATION ══ */}
                {step === 'otp' && (
                    <div>
                        {/* 6 individual OTP boxes */}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
                            {otpDigits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => inputRefs.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                    onPaste={i === 0 ? handleOtpPaste : undefined}
                                    style={{
                                        width: 48, height: 56, textAlign: 'center',
                                        fontSize: 22, fontWeight: 700,
                                        border: `2px solid ${digit ? '#2563EB' : '#D1D5DB'}`,
                                        borderRadius: 10, outline: 'none',
                                        background: 'rgba(255,255,255,0.6)',
                                        color: '#111827', transition: 'border-color 0.15s',
                                    }}
                                />
                            ))}
                        </div>

                        <button onClick={handleVerifyAndRegister} disabled={verifying}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-md px-5 py-3 text-center transition duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed mb-4">
                            {verifying ? 'Verifying...' : 'Verify & Register'}
                        </button>

                        {/* Resend + Back */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button onClick={() => setStep('form')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
                                ← Back
                            </button>
                            <button onClick={handleResend} disabled={resendCooldown > 0}
                                style={{ background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontSize: 13, color: resendCooldown > 0 ? '#9CA3AF' : '#2563EB', fontWeight: 600 }}>
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
