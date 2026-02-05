// components/profile/Profile/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiMail, 
  FiEdit2, 
  FiSave, 
  FiX, 
  FiCamera, 
  FiLock, 
  FiCheck,
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiGlobe,
  FiBriefcase,
  FiAward,
  FiShield,
  FiActivity,
  FiTrendingUp,
  FiAlertCircle,
  FiTrash2,
  FiLoader
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import * as userService from '../../../services/userService';
import { toast } from 'react-hot-toast';
import styles from './Profile.module.css';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    jobTitle: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalUploads: 0,
    totalRevenue: 0,
    joinDate: ''
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  
  const fileInputRef = useRef(null);

  // Fetch user data with stats on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUserWithStats();
      console.log('User data received:', userData);
      
      const transformedData = userService.transformUserData(userData);
      console.log('Transformed data:', transformedData);
      
      setFormData({
        username: transformedData.username || '',
        email: transformedData.email || '',
        firstName: transformedData.firstName || '',
        lastName: transformedData.lastName || '',
        phone: transformedData.phone || '',
        bio: transformedData.bio || '',
        location: transformedData.location || '',
        website: transformedData.website || '',
        jobTitle: transformedData.jobTitle || ''
      });
      
      setStats({
        totalRestaurants: transformedData.totalRestaurants || 0,
        totalUploads: transformedData.totalUploads || 0,
        totalRevenue: transformedData.totalRevenue || 0,
        joinDate: formatJoinDate(transformedData.createdAt)
      });
      
      if (transformedData.profileImage) {
        setPreviewImage(`${import.meta.env.VITE_API_URL}/uploads/${transformedData.profileImage}`);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
      
      // Fallback to user from context if API fails
      if (user) {
        const userData = user.data || user;
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          location: userData.location || '',
          website: userData.website || '',
          jobTitle: userData.job_title || ''
        });
        setStats({
          totalRestaurants: 0,
          totalUploads: 0,
          totalRevenue: 0,
          joinDate: formatJoinDate(userData.created_at)
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return 'Unknown';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.phone && !/^[\d\s\-\(\)\+]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    
    if (formData.website && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(formData.website)) {
      newErrors.website = 'Invalid website URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPEG, PNG, GIF, or WEBP');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB');
      return;
    }
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    try {
      setUploadingImage(true);
      await userService.uploadProfileImage(file);
      toast.success('Profile image updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload image');
      setPreviewImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setUploadingImage(true);
      await userService.removeProfileImage();
      setPreviewImage(null);
      toast.success('Profile image removed');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }
    
    try {
      setSaving(true);
      await userService.updateProfile(formData);
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      toast.success('Profile updated successfully');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      const message = error.response?.data?.detail || 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      toast.error('Please fix the errors before saving');
      return;
    }
    
    try {
      setChangingPassword(true);
      await userService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      const message = error.response?.data?.detail || 'Failed to change password';
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    fetchUserData();
  };

  // Animation variants - FIXED: removed dependency on useInView
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      x: 10,
      transition: { duration: 0.2 }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <FiLoader size={40} className={styles.spinIcon} />
        </div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.profileContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <motion.div
          className={styles.profileImageContainer}
          variants={itemVariants}
        >
          <div className={styles.profileImage}>
            {uploadingImage ? (
              <div className={styles.imageLoading}>
                <FiLoader size={30} className={styles.spinIcon} />
              </div>
            ) : previewImage ? (
              <img src={previewImage} alt="Profile" />
            ) : (
              <FiUser size={60} />
            )}
          </div>
          
          {isEditing && (
            <div className={styles.imageActions}>
              <label className={styles.imageUploadLabel}>
                <FiCamera size={18} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
              {previewImage && (
                <button 
                  className={styles.removeImageButton}
                  onClick={handleRemoveImage}
                  disabled={uploadingImage}
                  type="button"
                >
                  <FiTrash2 size={18} />
                </button>
              )}
            </div>
          )}
          
          <div className={styles.profileStatus}>
            <div className={styles.statusIndicator}></div>
            <span>Active</span>
          </div>
        </motion.div>
        
        <motion.div
          className={styles.profileInfo}
          variants={itemVariants}
        >
          <h1 className={styles.profileName}>
            {formData.firstName && formData.lastName 
              ? `${formData.firstName} ${formData.lastName}`
              : formData.username || 'User'
            }
          </h1>
          <p className={styles.profileEmail}>
            <FiMail size={14} />
            {formData.email || 'No email'}
          </p>
          {formData.jobTitle && (
            <p className={styles.profileJobTitle}>
              <FiBriefcase size={14} />
              {formData.jobTitle}
            </p>
          )}
          <div className={styles.profileMeta}>
            {formData.location && (
              <div className={styles.metaItem}>
                <FiMapPin size={14} />
                <span>{formData.location}</span>
              </div>
            )}
            {formData.phone && (
              <div className={styles.metaItem}>
                <FiPhone size={14} />
                <span>{formData.phone}</span>
              </div>
            )}
            {formData.website && (
              <div className={styles.metaItem}>
                <FiGlobe size={14} />
                <a 
                  href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {formData.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            <div className={styles.metaItem}>
              <FiCalendar size={14} />
              <span>Joined {stats.joinDate}</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className={styles.profileActions}
          variants={itemVariants}
        >
          {!isEditing ? (
            <motion.button
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
            >
              <FiEdit2 size={16} />
              Edit Profile
            </motion.button>
          ) : (
            <div className={styles.editActions}>
              <motion.button
                className={styles.saveButton}
                onClick={handleSaveProfile}
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
              >
                {saving ? (
                  <>
                    <FiLoader size={16} className={styles.spinIcon} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={16} />
                    Save Changes
                  </>
                )}
              </motion.button>
              <motion.button
                className={styles.cancelButton}
                onClick={handleCancelEdit}
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
              >
                <FiX size={16} />
                Cancel
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div 
        className={styles.statsSection}
        variants={itemVariants}
      >
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <FiBriefcase size={22} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalRestaurants}</h3>
            <p>Restaurants</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <FiActivity size={22} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalUploads}</h3>
            <p>Data Uploads</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
            <FiTrendingUp size={22} />
          </div>
          <div className={styles.statContent}>
            <h3>${stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
            <FiAward size={22} />
          </div>
          <div className={styles.statContent}>
            <h3>Premium</h3>
            <p>Account Type</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className={styles.profileTabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
          type="button"
        >
          <FiUser size={16} />
          Profile Information
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'security' ? styles.active : ''}`}
          onClick={() => setActiveTab('security')}
          type="button"
        >
          <FiShield size={16} />
          Security
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'preferences' ? styles.active : ''}`}
          onClick={() => setActiveTab('preferences')}
          type="button"
        >
          <FiActivity size={16} />
          Preferences
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.profileContent}>
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              className={styles.profileTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${errors.username ? styles.hasError : ''}`}>
                  <label htmlFor="username">
                    Username <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <span className={styles.errorMessage}>
                      <FiAlertCircle size={12} />
                      {errors.username}
                    </span>
                  )}
                </div>
                
                <div className={`${styles.formGroup} ${errors.email ? styles.hasError : ''}`}>
                  <label htmlFor="email">
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <span className={styles.errorMessage}>
                      <FiAlertCircle size={12} />
                      {errors.email}
                    </span>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                    placeholder="Enter first name"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                    placeholder="Enter last name"
                  />
                </div>
                
                <div className={`${styles.formGroup} ${errors.phone ? styles.hasError : ''}`}>
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <span className={styles.errorMessage}>
                      <FiAlertCircle size={12} />
                      {errors.phone}
                    </span>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="jobTitle">Job Title</label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                    placeholder="Enter job title"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                    placeholder="Enter location"
                  />
                </div>
                
                <div className={`${styles.formGroup} ${errors.website ? styles.hasError : ''}`}>
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                    placeholder="https://example.com"
                  />
                  {errors.website && (
                    <span className={styles.errorMessage}>
                      <FiAlertCircle size={12} />
                      {errors.website}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`${styles.bioTextarea} ${isEditing ? styles.editing : ''}`}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
                {isEditing && (
                  <span className={styles.charCount}>
                    {formData.bio?.length || 0}/500
                  </span>
                )}
              </div>
            </motion.div>
          )}
          
          {activeTab === 'security' && (
            <motion.div
              key="security"
              className={styles.profileTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {!showPasswordForm ? (
                <div className={styles.securitySection}>
                  <div className={styles.securityIcon}>
                    <FiShield size={48} />
                  </div>
                  <h3>Security Settings</h3>
                  <p>Manage your password and authentication settings to keep your account secure</p>
                  
                  <div className={styles.securityInfo}>
                    <div className={styles.securityItem}>
                      <FiLock size={20} />
                      <div>
                        <h4>Password</h4>
                        <p>Last changed: Never</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    className={styles.changePasswordButton}
                    onClick={() => setShowPasswordForm(true)}
                    type="button"
                  >
                    <FiLock size={16} />
                    Change Password
                  </button>
                </div>
              ) : (
                <div className={styles.passwordForm}>
                  <h3>Change Password</h3>
                  <p className={styles.passwordHint}>
                    Password must be at least 8 characters
                  </p>
                  
                  <div className={`${styles.formGroup} ${errors.currentPassword ? styles.hasError : ''}`}>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                    />
                    {errors.currentPassword && (
                      <span className={styles.errorMessage}>
                        <FiAlertCircle size={12} />
                        {errors.currentPassword}
                      </span>
                    )}
                  </div>
                  
                  <div className={`${styles.formGroup} ${errors.newPassword ? styles.hasError : ''}`}>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                    />
                    {errors.newPassword && (
                      <span className={styles.errorMessage}>
                        <FiAlertCircle size={12} />
                        {errors.newPassword}
                      </span>
                    )}
                  </div>
                  
                  <div className={`${styles.formGroup} ${errors.confirmPassword ? styles.hasError : ''}`}>
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                    />
                    {errors.confirmPassword && (
                      <span className={styles.errorMessage}>
                        <FiAlertCircle size={12} />
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.passwordActions}>
                    <button
                      className={styles.saveButton}
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      type="button"
                    >
                      {changingPassword ? (
                        <>
                          <FiLoader size={16} className={styles.spinIcon} />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiCheck size={16} />
                          Update Password
                        </>
                      )}
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setErrors({});
                      }}
                      disabled={changingPassword}
                      type="button"
                    >
                      <FiX size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              className={styles.profileTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className={styles.preferencesSection}>
                <h3>Notification Preferences</h3>
                <p>Control how and when you receive notifications</p>
                
                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h4>Email Notifications</h4>
                    <p>Receive email updates about your account activity</p>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                
                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h4>Analytics Reports</h4>
                    <p>Get weekly summaries of your restaurant performance</p>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                
                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h4>Anomaly Alerts</h4>
                    <p>Get notified when unusual patterns are detected</p>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                
                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h4>Marketing Updates</h4>
                    <p>Receive information about new features and updates</p>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
              
              <div className={styles.preferencesSection}>
                <h3>Display Preferences</h3>
                <p>Customize your dashboard experience</p>
                
                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h4>Compact View</h4>
                    <p>Show more data in less space</p>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                
                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h4>Show Animations</h4>
                    <p>Enable smooth transitions and animations</p>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Message Toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className={styles.successMessage}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <FiCheck size={20} />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;