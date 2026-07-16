import React, { useState, useEffect } from 'react';
import { Save, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import ProfilePictureUpload from './ProfilePictureUpload';
import { uploadProfilePicture } from '../Services/ProfileService';

const ProfileSettings = ({ userType = 'patient', userProfile, onProfileUpdate }) => {
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        ...userProfile
    });

    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // useState's initializer only runs once, at first mount — and userProfile is
    // still null then (it loads async in the parent). This effect re-syncs the
    // form fields once the real profile data actually arrives, and again if it
    // changes (e.g. after a save).
    useEffect(() => {
        if (userProfile) {
            setProfileData(prev => ({ ...prev, ...userProfile }));
        }
    }, [userProfile]);

    useEffect(() => {
        const imageUrl = userProfile?.profilePicture || userProfile?.profilepicture || userProfile?.imageUrl;
        if (imageUrl) {
            setProfilePicture(imageUrl);
        }
    }, [userProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (file, imageUrl) => {
        setProfilePictureFile(file);
        if (imageUrl) {
            setProfilePicture(imageUrl);
        }
    };

    const handleImageUpload = async () => {
        if (!profilePictureFile) return;

        setIsUploading(true);
        try {
            const imageUrl = await uploadProfilePicture(profilePictureFile, userType);

            setProfilePicture(imageUrl || profilePicture);
            setProfilePictureFile(null);

            // 🔽 NEW: push the updated picture up to the parent so Redux state stays in sync
            if (onProfileUpdate) {
                await onProfileUpdate({ profilePicture: imageUrl });
            }

            alert('Profile picture uploaded successfully!');
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Failed to upload profile picture. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // Call the parent component's update function
            if (onProfileUpdate) {
                await onProfileUpdate(profileData);
            }
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                        <User className="w-7 h-7" />
                        <span>Profile Settings</span>
                    </h2>
                    <p className="text-blue-100 mt-1">Manage your personal information and profile picture</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Picture Section */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                                <ProfilePictureUpload
                                    currentImage={profilePicture}
                                    onImageChange={handleImageChange}
                                    onImageUpload={handleImageUpload}
                                    isUploading={isUploading}
                                    size="large"
                                />
                            </div>
                        </div>

                        {/* Profile Information Section */}
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={profileData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your first name"
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={profileData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your last name"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={profileData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-2" />
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={profileData.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your address"
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;