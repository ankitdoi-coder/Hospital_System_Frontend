import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyResetToken } from '../../Services/AuthService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [tokenInput, setTokenInput] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifyingToken, setVerifyingToken] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [tokenVerified, setTokenVerified] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await forgotPassword(email);
            const responseMessage = response?.data?.message || 'Reset request sent successfully';
            setMessage(responseMessage);

            const tokenMatch = responseMessage.match(/Token:\s*([a-f0-9-]+)/i);
            if (tokenMatch) {
                setResetToken(tokenMatch[1]);
            }

            setEmailSent(true);
            setTokenVerified(false);
            setIsSuccess(true);
        } catch (error) {
            setEmailSent(false);
            setTokenVerified(false);
            setMessage(error.response?.data?.message || 'Failed to send reset email');
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const handleTokenVerify = async (e) => {
        e.preventDefault();
        const trimmedToken = tokenInput.trim();

        if (!trimmedToken) {
            setMessage('Please enter the reset token');
            setIsSuccess(false);
            return;
        }

        if (!email.trim()) {
            setMessage('Please enter your email first');
            setIsSuccess(false);
            return;
        }

        setVerifyingToken(true);
        setMessage('');

        try {
            const response = await verifyResetToken(email.trim(), trimmedToken);
            const verified = response === true || response?.success === true || response?.verified === true;

            if (verified) {
                setResetToken(trimmedToken);
                setTokenVerified(true);
                setIsSuccess(true);
                setMessage(response?.message || 'Token verified successfully');
            } else {
                setTokenVerified(false);
                setIsSuccess(false);
                setMessage(response?.message || 'Invalid token');
            }
        } catch (error) {
            setTokenVerified(false);
            setIsSuccess(false);
            setMessage(error.response?.data?.message || 'Invalid token');
        } finally {
            setVerifyingToken(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
                        <p className="text-gray-600 mt-2">Step 1: enter your email. Step 2: verify your reset token.</p>
                    </div>

                    {!emailSent ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>Send Reset Token</span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-left">
                                <p className="text-sm text-blue-800">
                                    A reset request was generated. Enter the token below to verify it before continuing.
                                </p>
                            </div>

                            <form onSubmit={handleTokenVerify} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Reset Token
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your reset token"
                                        value={tokenInput}
                                        onChange={(e) => setTokenInput(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={verifyingToken}
                                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {verifyingToken ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                            </svg>
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <span>Verify Token</span>
                                    )}
                                </button>
                            </form>

                            {tokenVerified && resetToken && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/reset-password/${resetToken}`)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    <span>Continue to Reset Password</span>
                                </button>
                            )}
                        </div>
                    )}

                    {message && (
                        <div className={`mt-4 p-4 rounded-xl ${isSuccess ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center justify-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Back to Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;