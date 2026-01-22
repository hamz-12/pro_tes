import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiEdit2,
  FiSave,
  FiUpload,
  FiShield,
  FiCheckCircle
} from 'react-icons/fi';
import styles from './Profile.module.css';

const Profile = ({ user = {}, onSave, onAvatarChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    bio: user.bio || '',
    role: user.role || '',
    joinDate: user.joinDate || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        if (onAvatarChange) {
          onAvatarChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
  };

  const stats = [
    { label: 'Total Logins', value: '1,247', change: '+12%' },
    { label: 'Active Days', value: '342', change: '+5%' },
    { label: 'Last Login', value: '2 hours ago', change: null },
    { label: 'Account Age', value: '1 year 3 months', change: null },
  ];

  return (
    <motion.div 
      className={styles.profile}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Profile Settings</h2>
          <p className={styles.subtitle}>Manage your personal information and account settings</p>
        </div>
        <div className={styles.headerRight}>
          {!isEditing ? (
            <button className={styles.editButton} onClick={() => setIsEditing(true)}>
              <FiEdit2 size={18} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className={styles.editActions}>
              <button className={styles.cancelButton} onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSave}>
                <FiSave size={18} />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* Left Column - Profile Info */}
        <div className={styles.leftColumn}>
          {/* Avatar Section */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className={styles.avatarImage} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <FiUser size={48} />
                  </div>
                )}
                {isEditing && (
                  <label className={styles.avatarUpload}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className={styles.avatarInput}
                    />
                    <FiUpload size={20} />
                    <span>Upload</span>
                  </label>
                )}
              </div>
              <div className={styles.avatarInfo}>
                <h3 className={styles.userName}>{formData.name}</h3>
                <p className={styles.userRole}>{formData.role}</p>
                <div className={styles.verificationStatus}>
                  <FiShield size={16} />
                  <span>Verified Account</span>
                  <FiCheckCircle size={14} className={styles.verifiedIcon} />
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info Form */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Personal Information</h4>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FiUser className={styles.formIcon} />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={styles.formInput}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className={styles.formValue}>{formData.name}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FiMail className={styles.formIcon} />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={styles.formInput}
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className={styles.formValue}>{formData.email}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FiPhone className={styles.formIcon} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={styles.formInput}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className={styles.formValue}>{formData.phone}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FiMapPin className={styles.formIcon} />
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={styles.formInput}
                    placeholder="Enter your address"
                  />
                ) : (
                  <div className={styles.formValue}>{formData.address}</div>
                )}
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.formLabel}>
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className={styles.formTextarea}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                ) : (
                  <div className={styles.formValue}>{formData.bio || 'No bio provided'}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats and Additional Info */}
        <div className={styles.rightColumn}>
          {/* Account Stats */}
          <div className={styles.statsSection}>
            <h4 className={styles.sectionTitle}>Account Statistics</h4>
            <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className={styles.statCard}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                  {stat.change && (
                    <div className={styles.statChange}>{stat.change}</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Account Information */}
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Account Information</h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Member Since</span>
                <div className={styles.infoValue}>
                  <FiCalendar className={styles.infoIcon} />
                  <span>{formData.joinDate}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Account Type</span>
                <div className={styles.infoValue}>
                  <span className={styles.accountType}>Premium</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Timezone</span>
                <div className={styles.infoValue}>UTC-05:00 (EST)</div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Language</span>
                <div className={styles.infoValue}>English (US)</div>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className={styles.securitySection}>
            <h4 className={styles.sectionTitle}>Security Status</h4>
            <div className={styles.securityItems}>
              <div className={styles.securityItem}>
                <div className={styles.securityStatus}>
                  <div className={styles.statusIndicator} />
                  <span>Email Verification</span>
                </div>
                <span className={styles.securityStatusText}>Verified</span>
              </div>
              <div className={styles.securityItem}>
                <div className={styles.securityStatus}>
                  <div className={styles.statusIndicator} />
                  <span>Two-Factor Authentication</span>
                </div>
                <button className={styles.securityAction}>Enable</button>
              </div>
              <div className={styles.securityItem}>
                <div className={styles.securityStatus}>
                  <div className={styles.statusIndicator} />
                  <span>Password Strength</span>
                </div>
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBar}>
                    <div className={styles.strengthFill} style={{ width: '85%' }} />
                  </div>
                  <span className={styles.strengthText}>Strong</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.actionsSection}>
            <h4 className={styles.sectionTitle}>Quick Actions</h4>
            <div className={styles.actionButtons}>
              <button className={styles.actionButton}>
                <FiShield size={18} />
                <span>Change Password</span>
              </button>
              <button className={styles.actionButton}>
                <FiMail size={18} />
                <span>Update Email</span>
              </button>
              <button className={styles.actionButton}>
                <FiUser size={18} />
                <span>Privacy Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;