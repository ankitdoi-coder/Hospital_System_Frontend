# Profile Picture Upload Feature

## Overview
This feature adds professional profile picture upload functionality to both Patient and Doctor panels in the Healthcare System. Users can upload, view, and manage their profile pictures with a modern drag-and-drop interface.

## Features Implemented

### Frontend Components

#### 1. ProfilePictureUpload Component (`src/Components/ProfilePictureUpload.jsx`)
- **Drag & Drop Interface**: Modern drag-and-drop file upload
- **Image Preview**: Real-time preview of selected images
- **File Validation**: 
  - Supported formats: JPEG, PNG, WebP
  - Maximum file size: 5MB
  - Client-side validation with user-friendly error messages
- **Upload Progress**: Visual feedback during upload process
- **Remove Functionality**: Option to remove uploaded images

#### 2. ProfileSettings Component (`src/Components/ProfileSettings.jsx`)
- **Complete Profile Management**: Combined profile picture and personal information editing
- **Form Integration**: Seamless integration with user profile data
- **Local Storage Caching**: Offline image caching for better performance
- **Responsive Design**: Works on all device sizes

#### 3. ProfileService (`src/Services/ProfileService.js`)
- **API Integration**: Handles all profile picture API calls
- **Authentication**: Automatic JWT token handling
- **Local Storage Management**: Caches images locally for offline access
- **Error Handling**: Comprehensive error handling and user feedback

### Backend Implementation

#### 1. ProfileController (`Controller/ProfileController.java`)
- **RESTful Endpoints**: 
  - `POST /api/patient/profile/picture` - Upload patient profile picture
  - `GET /api/patient/profile/picture` - Get patient profile picture URL
  - `DELETE /api/patient/profile/picture` - Delete patient profile picture
  - `POST /api/doctor/profile/picture` - Upload doctor profile picture
  - `GET /api/doctor/profile/picture` - Get doctor profile picture URL
  - `DELETE /api/doctor/profile/picture` - Delete doctor profile picture
- **Security**: Role-based access control with Spring Security
- **File Validation**: Server-side file type and size validation

#### 2. ProfileService (`Service/ProfileService.java`)
- **File Management**: Secure file storage and retrieval
- **Database Operations**: Profile picture metadata management
- **File System Integration**: Organized file storage structure
- **Cleanup Operations**: Automatic cleanup of old files when updating

#### 3. ProfilePicture Entity (`Entity/ProfilePicture.java`)
- **Database Mapping**: JPA entity for profile picture metadata
- **Audit Fields**: Created and updated timestamps
- **Constraints**: Unique constraint per user to prevent duplicates

#### 4. FileController (`Controller/FileController.java`)
- **File Serving**: Serves profile picture files with proper headers
- **Content Type Detection**: Automatic MIME type detection
- **Caching**: HTTP caching headers for better performance
- **Security**: Secure file access

### Database Schema

#### Profile Pictures Table
```sql
CREATE TABLE profile_pictures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('PATIENT', 'DOCTOR')),
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_profile (user_email, user_type),
    INDEX idx_user_email_type (user_email, user_type)
);
```

## Integration Points

### Patient Dashboard
- **Navigation**: Added "Profile Settings" menu item
- **Welcome Section**: Displays user profile picture
- **Sidebar**: Shows profile picture in user info section
- **Header**: Profile picture in top navigation

### Doctor Dashboard
- **Navigation**: Added "Profile Settings" menu item  
- **Sidebar**: Shows profile picture in doctor info section
- **Profile Management**: Complete profile settings page

## File Structure

```
Frontend:
├── src/Components/
│   ├── ProfilePictureUpload.jsx     # Reusable upload component
│   ├── ProfileSettings.jsx          # Complete profile management
│   └── DashBoards/
│       ├── PatientDashboard.jsx     # Updated with profile features
│       └── DoctorDashboard.jsx      # Updated with profile features
├── src/Services/
│   └── ProfileService.js            # API service for profile operations

Backend:
├── Controller/
│   ├── ProfileController.java       # Profile picture API endpoints
│   └── FileController.java          # File serving endpoints
├── Service/
│   └── ProfileService.java          # Business logic for profile operations
├── Entity/
│   └── ProfilePicture.java          # Database entity
├── Repository/
│   └── ProfilePictureRepository.java # Data access layer
└── resources/db/migration/
    └── V3__Create_profile_pictures_table.sql # Database migration
```

## Security Features

1. **Authentication**: JWT token-based authentication
2. **Authorization**: Role-based access (PATIENT/DOCTOR)
3. **File Validation**: 
   - File type restrictions (images only)
   - File size limits (5MB max)
   - Filename sanitization
4. **Secure Storage**: Files stored outside web root
5. **Access Control**: Users can only access their own profile pictures

## Performance Optimizations

1. **Local Storage Caching**: Images cached locally for faster loading
2. **HTTP Caching**: Proper cache headers for file serving
3. **File Compression**: Automatic image optimization (can be extended)
4. **Lazy Loading**: Profile pictures loaded on demand
5. **Database Indexing**: Optimized queries with proper indexes

## Usage Instructions

### For Users:
1. Navigate to "Profile Settings" in the dashboard
2. Click on the profile picture area or drag & drop an image
3. Select an image file (JPEG, PNG, or WebP, max 5MB)
4. Preview the image and click "Upload Photo"
5. Save profile changes

### For Developers:
1. Run database migration to create the profile_pictures table
2. Ensure upload directory exists and has proper permissions
3. Configure file storage path in application properties
4. Test API endpoints with proper authentication

## API Documentation

### Upload Profile Picture
```http
POST /api/{userType}/profile/picture
Content-Type: multipart/form-data
Authorization: Bearer {jwt-token}

Body: profilePicture (file)
```

### Get Profile Picture URL
```http
GET /api/{userType}/profile/picture
Authorization: Bearer {jwt-token}
```

### Delete Profile Picture
```http
DELETE /api/{userType}/profile/picture
Authorization: Bearer {jwt-token}
```

### Serve Profile Picture File
```http
GET /api/files/profile-pictures/{filename}
```

## Future Enhancements

1. **Image Resizing**: Automatic image resizing and thumbnail generation
2. **Cloud Storage**: Integration with AWS S3 or similar services
3. **Image Filters**: Basic image editing capabilities
4. **Bulk Operations**: Admin functionality for managing all profile pictures
5. **Analytics**: Track profile picture usage and engagement

## Testing

### Frontend Testing:
- Test file upload with various file types and sizes
- Test drag & drop functionality
- Test error handling for invalid files
- Test responsive design on different devices

### Backend Testing:
- Test API endpoints with proper authentication
- Test file validation and error responses
- Test database operations and constraints
- Test file serving and caching

## Deployment Notes

1. **File Permissions**: Ensure upload directory has proper write permissions
2. **Storage Space**: Monitor disk space for uploaded files
3. **Backup Strategy**: Include uploaded files in backup procedures
4. **Load Balancing**: Consider file storage strategy for multiple server instances
5. **CDN Integration**: Consider CDN for serving profile pictures in production

This implementation provides a complete, production-ready profile picture upload feature with modern UI/UX, robust security, and excellent performance characteristics.