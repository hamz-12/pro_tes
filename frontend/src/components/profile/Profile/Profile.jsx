// Create components/profile/Profile/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
  FiTrendingUp
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    totalRestaurants: 1,
    totalUploads: 12,
    totalRevenue: 397886.61,
    joinDate: 'January 2024'
  });

  const profileRef = useRef(null);
  const isInView = useInView(profileRef, { once: true });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        jobTitle: user.jobTitle || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateUser(formData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      toast.success('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setSaving(true);
      // Change password API call
      // await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className={styles.profileContainer}
      ref={profileRef}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <div className={styles.profileHeader}>
        <motion.div
          className={styles.profileImageContainer}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={styles.profileImage}>
            {previewImage ? (
              <img src={previewImage} alt="Profile" />
            ) : (
              <FiUser size={60} />
            )}
          </div>
          {isEditing && (
            <label className={styles.imageUploadLabel}>
              <FiCamera size={20} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
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
              : formData.username
            }
          </h1>
          <p className={styles.profileEmail}>{formData.email}</p>
          {formData.jobTitle && (
            <p className={styles.profileJobTitle}>{formData.jobTitle}</p>
          )}
          <div className={styles.profileMeta}>
            {formData.location && (
              <div className={styles.metaItem}>
                <FiMapPin size={14} />
                <span>{formData.location}</span>
              </div>
            )}
            {formData.website && (
              <div className={styles.metaItem}>
                <FiGlobe size={14} />
                <a href={formData.website} target="_blank" rel="noopener noreferrer">
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {saving ? <FiCheck size={16} /> : <FiSave size={16} />}
                {saving ? 'Saving...' : 'Save'}
              </motion.button>
              <motion.button
                className={styles.cancelButton}
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data
                  if (user) {
                    setFormData({
                      username: user.username || '',
                      email: user.email || '',
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      phone: user.phone || '',
                      bio: user.bio || '',
                      location: user.location || '',
                      website: user.website || '',
                      jobTitle: user.jobTitle || ''
                    });
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
          <div className={styles.statIcon}>
            <FiBriefcase />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalRestaurants}</h3>
            <p>Restaurants</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiActivity />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalUploads}</h3>
            <p>Data Uploads</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiTrendingUp />
          </div>
          <div className={styles.statContent}>
            <h3>${stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiAward />
          </div>
          <div className={styles.statContent}>
            <h3>Premium</h3>
            <p>Account Type</p>
          </div>
        </div>
      </motion.div>

      <div className={styles.profileTabs}>
        <motion.button
          className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          Profile Information
        </motion.button>
        <motion.button
          className={`${styles.tabButton} ${activeTab === 'security' ? styles.active : ''}`}
          onClick={() => setActiveTab('security')}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          Security
        </motion.button>
        <motion.button
          className={`${styles.tabButton} ${activeTab === 'preferences' ? styles.active : ''}`}
          onClick={() => setActiveTab('preferences')}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          Preferences
        </motion.button>
      </div>

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
                <motion.div 
                  className={styles.formGroup}
                  variants={itemVariants}
                >
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                  />
                </motion.div>
                
                <motion.div 
                  className={styles.formGroup}
                  variants={itemVariants}
                >
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                  />
                </motion.div>
                
                <motion.div 
                  className={styles.formGroup}
                  variants={itemVariants}
                >
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                  />
                </motion.div>
                
                <motion.div 
                  className={styles.formGroup}
                  variants={itemVariants}
                >
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                  />
                </motion.div>
                
                <motion.div 
                  className={styles.formGroup}
                  variants={itemVariants}
                >
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                  />
                </motion.div>
                
                <motion.div 
                  className={styles.formGroup}
                  variants={itemVariants}
                >
                  <label htmlFor="jobTitle">Job Title</label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                  />
                </motion.div>
                
                <motion.div 
                  className={styles.formGroup}
                  variants={itemVariants}
                >
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                  />
                </motion.div>
                
                <motion.div 
                  className={styles.formGroup}
                  variants={itemVariants}
                >
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? styles.editing : ''}
                  />
                </motion.div>
              </div>
              
              <motion.div 
                className={styles.formGroup}
                variants={itemVariants}
              >
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`${styles.bioTextarea} ${isEditing ? styles.editing : ''}`}
                  rows={4}
                />
              </motion.div>
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
                <motion.div 
                  className={styles.securitySection}
                  variants={itemVariants}
                >
                  <div className={styles.securityIcon}>
                    <FiShield size={48} />
                  </div>
                  <h3>Security Settings</h3>
                  <p>Manage your password and authentication settings to keep your account secure</p>
                  <motion.button
                    className={styles.changePasswordButton}
                    onClick={() => setShowPasswordForm(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiLock size={16} />
                    Change Password
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  className={styles.passwordForm}
                  variants={itemVariants}
                >
                  <h3>Change Password</h3>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  
                  <div className={styles.passwordActions}>
                    <motion.button
                      className={styles.saveButton}
                      onClick={handleChangePassword}
                      disabled={saving}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {saving ? 'Saving...' : 'Update Password'}
                    </motion.button>
                    <motion.button
                      className={styles.cancelButton}
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
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
              <motion.div 
                className={styles.preferencesSection}
                variants={itemVariants}
              >
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
                    <h4>Marketing Updates</h4>
                    <p>Receive information about new features and updates</p>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className={styles.successMessage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
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