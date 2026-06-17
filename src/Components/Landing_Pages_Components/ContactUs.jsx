import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
// Using lucide-react for a consistent icon style across the app
import { Phone, Mail, MapPin, Clock, User, MessageSquare, Send, RefreshCw } from 'lucide-react';
import apiClient from '../../API/axiosConfig';
import { toast } from 'sonner';

const ContactUs = () => {
    const { register, handleSubmit: handleFormSubmit, reset, formState: { errors } } = useForm();

    // State for the dynamic CAPTCHA
    const [captchaText, setCaptchaText] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');

    // Function to generate a random CAPTCHA string
    const generateCaptcha = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaText(result);
    };

    // Generate the first CAPTCHA when the component mounts
    useEffect(() => {
        generateCaptcha();
    }, []);

    // Memoize the SVG background to prevent re-rendering
    const SvgBackground = useMemo(() => (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="dot-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="2" fill="currentColor" className="text-indigo-600/50" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dot-pattern)" />
            </svg>
        </div>
    ), []);


    const onSubmit = async (data) => {
        if (captchaInput !== captchaText) {
            alert("CAPTCHA validation failed. Please try again.");
            generateCaptcha();
            setCaptchaInput('');
            return;
        }

        try {
            await apiClient.post('/api/contact', data);
            // alert("Thank you for your message! We will get back to you shortly.");
            toast.success("Thank you for your message! We will get back to you shortly.")
            reset();
            setCaptchaInput('');
            generateCaptcha();
        } catch (error) {
            // alert("Failed to submit. Please try again.");
            toast.error("Failed to submit. Please try again.")
            console.error(error);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-24">
            <motion.div
                className="max-w-6xl w-full mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left Side: Contact Information */}
                    <div className="bg-indigo-700 text-white p-8 md:p-12 relative">
                        {SvgBackground}
                        <motion.div className="relative z-10" variants={containerVariants} initial="hidden" animate="visible">
                            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-extrabold mb-2">Get In Touch</motion.h2>
                            <motion.p variants={itemVariants} className="text-indigo-200 mb-8">We're here to help you. Reach out to us anytime.</motion.p>

                            <motion.div className="space-y-6" variants={containerVariants}>
                                <motion.div variants={itemVariants} className="flex items-start gap-4">
                                    <Phone className="text-indigo-300 text-xl mt-1" />
                                    <div>
                                        <h3 className="font-bold">Phone Number</h3>
                                        <p className="text-indigo-200">+91 80004 36640</p>
                                    </div>
                                </motion.div>
                                <motion.div variants={itemVariants} className="flex items-start gap-4">
                                    <Mail className="text-indigo-300 text-xl mt-1" />
                                    <div>
                                        <h3 className="font-bold">Email Address</h3>
                                        <p className="text-indigo-200">info@healthcarecopilot.com</p>
                                    </div>
                                </motion.div>
                                <motion.div variants={itemVariants} className="flex items-start gap-4">
                                    <MapPin className="text-indigo-300 text-xl mt-1" />
                                    <div>
                                        <h3 className="font-bold">Location</h3>
                                        <p className="text-indigo-200">Rhythm Plaza, Nr. Amar Javan Circle, Nikol, Gujarat - 382350</p>
                                    </div>
                                </motion.div>
                                <motion.div variants={itemVariants} className="flex items-start gap-4">
                                    <Clock className="text-indigo-300 text-xl mt-1" />
                                    <div>
                                        <h3 className="font-bold">Working Hours</h3>
                                        <p className="text-indigo-200">24x7 Support Available</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right Side: Contact Form */}
                    <div className="bg-white p-8 md:p-12">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6">Send us a Message</h2>
                        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                    <input {...register('name', { required: 'Name is required' })} type="text" placeholder="Full Name *" className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                            </div>
                            <div>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                    <input {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' } })} type="email" placeholder="Email ID *" className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                            <div>
                                <div className="relative">
                                    <MessageSquare className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                    <input {...register('subject', { required: 'Subject is required' })} type="text" placeholder="Subject *" className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                            </div>
                            <div>
                                <div className="relative">
                                    <MessageSquare className="absolute top-4 left-3 text-gray-400" />
                                    <textarea {...register('message', { required: 'Message is required' })} placeholder="Your Message *" rows="4" className="w-full pl-10 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
                                </div>
                                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Please solve the CAPTCHA *</label>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="w-32 text-center bg-gray-200 p-3 rounded-lg select-none">
                                        <span className="text-2xl font-bold tracking-widest font-mono italic text-gray-600">{captchaText}</span>
                                    </div>
                                    <button type="button" onClick={generateCaptcha} className="p-3 text-gray-600 hover:text-indigo-600"><RefreshCw size={20} /></button>
                                    <input type="text" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-lg font-bold text-white
                                                     bg-gradient-to-br from-purple-600 to-blue-500
                                                     hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
                                                     transition-all duration-300 ease-in-out transform hover:scale-105"
                            >
                                Submit Message <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ContactUs;