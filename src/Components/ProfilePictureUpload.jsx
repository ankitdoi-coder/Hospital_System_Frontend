import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

const ProfilePictureUpload = ({ 
    currentImage, 
    onImageChange, 
    onImageUpload, 
    isUploading = false,
    size = 'large' // 'small', 'medium', 'large'
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [previewImage, setPreviewImage] = useState(currentImage);
    const fileInputRef = useRef(null);

    const sizeClasses = {
        small: 'w-16 h-16',
        medium: 'w-24 h-24', 
        large: 'w-32 h-32'
    };

    const validateFile = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, WebP)');
            return false;
        }

        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            return false;
        }

        return true;
    };

    const handleFileSelect = (file) => {
        if (!validateFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            setPreviewImage(imageUrl);
            onImageChange?.(file, imageUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        onImageChange?.(null, null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Profile Picture Display */}
            <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-lg`}>
                {previewImage ? (
                    <img
                        src={previewImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <User className="w-1/2 h-1/2 text-gray-400" />
                    </div>
                )}
                
                {/* Remove button */}
                {previewImage && (
                    <button
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                        disabled={isUploading}
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50 ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={isUploading}
                />

                <div className="flex flex-col items-center space-y-2">
                    {isUploading ? (
                        <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-sm text-gray-600">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Camera className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Drop your photo here, or <span className="text-blue-600">browse</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, WebP up to 5MB
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Upload Button */}
            {previewImage && onImageUpload && (
                <button
                    onClick={onImageUpload}
                    disabled={isUploading}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                </button>
            )}
        </div>
    );
};

export default ProfilePictureUpload;