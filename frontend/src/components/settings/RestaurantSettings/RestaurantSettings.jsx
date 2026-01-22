import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiMapPin,
  FiPhone,
  FiGlobe,
  FiClock,
  FiDollarSign,
  FiCreditCard,
  FiShoppingCart,
  FiSave,
  FiUpload,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import styles from './RestaurantSettings.module.css';

const RestaurantSettings = ({ restaurant = {}, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: restaurant.name || '',
    address: restaurant.address || '',
    phone: restaurant.phone || '',
    website: restaurant.website || '',
    email: restaurant.email || '',
    cuisine: restaurant.cuisine || '',
    description: restaurant.description || '',
    taxRate: restaurant.taxRate || 8.5,
    serviceCharge: restaurant.serviceCharge || 10,
    currency: restaurant.currency || 'USD',
    timezone: restaurant.timezone || 'UTC-05:00',
  });

  const [operatingHours, setOperatingHours] = useState(
    restaurant.operatingHours || [
      { day: 'Monday', open: '09:00', close: '22:00', enabled: true },
      { day: 'Tuesday', open: '09:00', close: '22:00', enabled: true },
      { day: 'Wednesday', open: '09:00', close: '22:00', enabled: true },
      { day: 'Thursday', open: '09:00', close: '22:00', enabled: true },
      { day: 'Friday', open: '09:00', close: '23:00', enabled: true },
      { day: 'Saturday', open: '10:00', close: '23:00', enabled: true },
      { day: 'Sunday', open: '10:00', close: '21:00', enabled: true },
    ]
  );

  const [paymentMethods, setPaymentMethods] = useState(
    restaurant.paymentMethods || [
      { id: 'cash', name: 'Cash', enabled: true },
      { id: 'credit', name: 'Credit Card', enabled: true },
      { id: 'debit', name: 'Debit Card', enabled: true },
      { id: 'mobile', name: 'Mobile Payment', enabled: false },
      { id: 'online', name: 'Online Payment', enabled: true },
    ]
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOperatingHourChange = (index, field, value) => {
    const updatedHours = [...operatingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setOperatingHours(updatedHours);
  };

  const handlePaymentMethodToggle = (id) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
  };

  const handleSave = () => {
    const settings = {
      ...formData,
      operatingHours,
      paymentMethods,
    };
    if (onSave) {
      onSave(settings);
    }
    setIsEditing(false);
  };

  const stats = [
    { label: 'Avg. Daily Orders', value: '145', change: '+8%' },
    { label: 'Customer Rating', value: '4.7', change: '+0.2' },
    { label: 'Peak Hours', value: '7-9 PM', change: null },
    { label: 'Avg. Wait Time', value: '12 min', change: '-3 min' },
  ];

  return (
    <motion.div 
      className={styles.restaurantSettings}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>
            <FiHome className={styles.titleIcon} />
            Restaurant Settings
          </h2>
          <p className={styles.subtitle}>
            Manage your restaurant information, operating hours, and preferences
          </p>
        </div>
        <div className={styles.headerRight}>
          {!isEditing ? (
            <button className={styles.editButton} onClick={() => setIsEditing(true)}>
              <FiSave size={18} />
              <span>Edit Settings</span>
            </button>
          ) : (
            <div className={styles.editActions}>
              <button className={styles.cancelButton} onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSave}>
                <FiCheckCircle size={18} />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* Left Column - Basic Info */}
        <div className={styles.leftColumn}>
          {/* Basic Information */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Basic Information</h4>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FiHome className={styles.formIcon} />
                  Restaurant Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={styles.formInput}
                    placeholder="Enter restaurant name"
                  />
                ) : (
                  <div className={styles.formValue}>{formData.name}</div>
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
                    placeholder="Enter restaurant address"
                  />
                ) : (
                  <div className={styles.formValue}>{formData.address}</div>
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
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className={styles.formValue}>{formData.phone}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FiGlobe className={styles.formIcon} />
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className={styles.formInput}
                    placeholder="Enter website URL"
                  />
                ) : (
                  <div className={styles.formValue}>{formData.website || 'Not provided'}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Cuisine Type
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.cuisine}
                    onChange={(e) => handleInputChange('cuisine', e.target.value)}
                    className={styles.formInput}
                    placeholder="e.g., Italian, Mexican, etc."
                  />
                ) : (
                  <div className={styles.formValue}>{formData.cuisine}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Currency
                </label>
                {isEditing ? (
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                ) : (
                  <div className={styles.formValue}>{formData.currency}</div>
                )}
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>
                <FiClock className={styles.sectionTitleIcon} />
                Operating Hours
              </h4>
              {isEditing && (
                <button className={styles.addHoursButton}>
                  + Add Special Hours
                </button>
              )}
            </div>
            
            <div className={styles.operatingHours}>
              {operatingHours.map((day, index) => (
                <div key={day.day} className={styles.daySchedule}>
                  <div className={styles.dayInfo}>
                    <span className={styles.dayName}>{day.day}</span>
                    {!day.enabled && (
                      <span className={styles.closedLabel}>Closed</span>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className={styles.timeControls}>
                      <div className={styles.timeToggle}>
                        <label className={styles.toggleLabel}>
                          <input
                            type="checkbox"
                            checked={day.enabled}
                            onChange={(e) => handleOperatingHourChange(index, 'enabled', e.target.checked)}
                            className={styles.toggleInput}
                          />
                          <span className={styles.toggleSlider} />
                        </label>
                      </div>
                      
                      {day.enabled && (
                        <div className={styles.timeInputs}>
                          <input
                            type="time"
                            value={day.open}
                            onChange={(e) => handleOperatingHourChange(index, 'open', e.target.value)}
                            className={styles.timeInput}
                          />
                          <span className={styles.timeSeparator}>to</span>
                          <input
                            type="time"
                            value={day.close}
                            onChange={(e) => handleOperatingHourChange(index, 'close', e.target.value)}
                            className={styles.timeInput}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.timeDisplay}>
                      {day.enabled ? (
                        <span className={styles.timeRange}>
                          {day.open} - {day.close}
                        </span>
                      ) : (
                        <span className={styles.closedText}>Closed</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Financial & Stats */}
        <div className={styles.rightColumn}>
          {/* Restaurant Stats */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Restaurant Statistics</h4>
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

          {/* Financial Settings */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <FiDollarSign className={styles.sectionTitleIcon} />
              Financial Settings
            </h4>
            <div className={styles.financialSettings}>
              <div className={styles.financialGroup}>
                <label className={styles.financialLabel}>Tax Rate</label>
                {isEditing ? (
                  <div className={styles.financialInputGroup}>
                    <input
                      type="number"
                      value={formData.taxRate}
                      onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                      className={styles.financialInput}
                      min="0"
                      max="50"
                      step="0.1"
                    />
                    <span className={styles.financialUnit}>%</span>
                  </div>
                ) : (
                  <div className={styles.financialValue}>{formData.taxRate}%</div>
                )}
              </div>

              <div className={styles.financialGroup}>
                <label className={styles.financialLabel}>Service Charge</label>
                {isEditing ? (
                  <div className={styles.financialInputGroup}>
                    <input
                      type="number"
                      value={formData.serviceCharge}
                      onChange={(e) => handleInputChange('serviceCharge', parseFloat(e.target.value))}
                      className={styles.financialInput}
                      min="0"
                      max="30"
                      step="0.5"
                    />
                    <span className={styles.financialUnit}>%</span>
                  </div>
                ) : (
                  <div className={styles.financialValue}>{formData.serviceCharge}%</div>
                )}
              </div>

              <div className={styles.financialGroup}>
                <label className={styles.financialLabel}>Timezone</label>
                {isEditing ? (
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className={styles.financialSelect}
                  >
                    <option value="UTC-05:00">EST (UTC-05:00)</option>
                    <option value="UTC-08:00">PST (UTC-08:00)</option>
                    <option value="UTC-06:00">CST (UTC-06:00)</option>
                    <option value="UTC-07:00">MST (UTC-07:00)</option>
                    <option value="UTC+00:00">GMT (UTC+00:00)</option>
                  </select>
                ) : (
                  <div className={styles.financialValue}>{formData.timezone}</div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <FiCreditCard className={styles.sectionTitleIcon} />
              Payment Methods
            </h4>
            <div className={styles.paymentMethods}>
              {paymentMethods.map((method) => (
                <div key={method.id} className={styles.paymentMethod}>
                  <div className={styles.paymentInfo}>
                    <div className={styles.paymentIcon}>
                      {method.id === 'cash' && <FiDollarSign />}
                      {method.id === 'credit' && <FiCreditCard />}
                      {method.id === 'debit' && <FiCreditCard />}
                      {method.id === 'mobile' && <FiGlobe />}
                      {method.id === 'online' && <FiShoppingCart />}
                    </div>
                    <span className={styles.paymentName}>{method.name}</span>
                  </div>
                  
                  {isEditing ? (
                    <label className={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={method.enabled}
                        onChange={() => handlePaymentMethodToggle(method.id)}
                        className={styles.toggleInput}
                      />
                      <span className={styles.toggleSlider} />
                    </label>
                  ) : (
                    <div className={styles.paymentStatus}>
                      {method.enabled ? (
                        <span className={styles.enabledStatus}>Enabled</span>
                      ) : (
                        <span className={styles.disabledStatus}>Disabled</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Quick Actions</h4>
            <div className={styles.actionButtons}>
              <button className={styles.actionButton}>
                <FiUpload size={18} />
                <span>Upload Menu</span>
              </button>
              <button className={styles.actionButton}>
                <FiAlertCircle size={18} />
                <span>View Reports</span>
              </button>
              <button className={styles.actionButton}>
                <FiCheckCircle size={18} />
                <span>Verify Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantSettings;