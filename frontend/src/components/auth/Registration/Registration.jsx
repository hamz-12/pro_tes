// frontend/src/components/Registration/Registration.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiArrowRight,
  FiHome,
  FiAlertCircle,
  FiMapPin,
  FiPhone,
  FiFileText,
} from 'react-icons/fi';
import { authService } from '../../../services/authService';
import { restaurantService } from '../../../services/restaurantService';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import styles from './Registration.module.css';

const Registration = ({ 
  onSuccess, 
  onLoginClick, 
  isModal = false,
  closeModal 
}) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    getValues,
  } = useForm({
    mode: 'onChange',
  });

  const password = watch('password');

  const steps = [
    { number: 1, title: 'Account Details', icon: FiUser },
    { number: 2, title: 'Restaurant Info', icon: FiHome },
    { number: 3, title: 'Confirmation', icon: FiCheck },
  ];

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await trigger(['username', 'email', 'password', 'confirmPassword']);
      if (isValid) {
        // Save user data
        const userFormData = {
          username: getValues('username'),
          email: getValues('email'),
          password: getValues('password'),
        };
        setUserData(userFormData);
        setStep(2);
      }
    } else if (step === 2) {
      const isValid = await trigger(['name', 'address', 'phone']);
      if (isValid) {
        // Save restaurant data
        const restaurantFormData = {
          name: getValues('name'),
          address: getValues('address'),
          phone: getValues('phone'),
          description: getValues('description'),
        };
        setRestaurantData(restaurantFormData);
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!userData || !restaurantData) {
      setError('Missing user or restaurant data');
      return;
    }

    setIsLoading(true);
    setError('');
    setIsSubmitting(true);

    try {
      // Step 1: Register the user
      const userRegistrationData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      };
      
      const userResult = await authService.register(userRegistrationData);
      console.log('User Result: ', userResult);
      
      // Step 2: Log in to get auth token using the stored userData
      try {
        const result = await login(userData.email, userData.password);
        console.log('Login Result: ', result);
        
        // Step 3: Create the restaurant (the API interceptor will automatically add the auth token)
        const restaurantResult = await restaurantService.createRestaurant(restaurantData);
        
        if (!restaurantResult.success) {
          console.error('Restaurant creation failed:', restaurantResult.message);
          // We still consider registration successful, just show a warning
          toast.success('Account created successfully! You can add your restaurant later from your dashboard.');
        } else {
          toast.success('Account and restaurant created successfully!');
        }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } catch (loginError) {
        console.error('Login after registration failed:', loginError);
        toast.success('Account created successfully! You can now log in with your credentials.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');

      }
      
      // Close modal if needed
      if (isModal && closeModal) {
        closeModal();
      }
      
      // Navigate to login page with success message
      if (onSuccess) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        onSuccess();
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'An unexpected error occurred';
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const passwordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: '#64748b' };
    
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    const strength = {
      0: { label: 'Very Weak', color: '#ef4444' },
      1: { label: 'Weak', color: '#f59e0b' },
      2: { label: 'Fair', color: '#eab308' },
      3: { label: 'Good', color: '#84cc16' },
      4: { label: 'Strong', color: '#10b981' },
    };
    
    return { score, ...strength[score] };
  };

  const passStrength = passwordStrength(password);

  return (
    <motion.div
      className={`${styles.registrationContainer} ${isModal ? styles.modal : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <motion.div
            className={styles.logo}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <div className={styles.logoIcon}>
              <FiUser size={32} />
            </div>
          </motion.div>
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Create Account
          </motion.h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Join our restaurant analytics platform
          </motion.p>
        </div>

        <div className={styles.steps}>
          {steps.map((s) => (
            <div
              key={s.number}
              className={`${styles.step} ${
                step === s.number
                  ? styles.active
                  : step > s.number
                  ? styles.completed
                  : ''
              }`}
            >
              <div className={styles.stepNumber}>
                {step > s.number ? (
                  <FiCheck size={16} />
                ) : (
                  <s.icon size={16} />
                )}
              </div>
              <span className={styles.stepTitle}>{s.title}</span>
              <div className={styles.stepLine} />
            </div>
          ))}
        </div>

        {/* Remove handleSubmit from form and add it only to the submit button */}
        <div className={styles.form}>
          {/* Step 1: Account Details */}
          <div className={`${styles.formStep} ${step === 1 ? styles.active : ''}`}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FiUser className={styles.labelIcon} />
                Username
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Username can only contain letters, numbers, and underscores',
                    },
                  })}
                  className={`${styles.input} ${errors.username ? styles.error : ''}`}
                  placeholder="Choose a username"
                  autoComplete="username"
                />
                <div className={styles.inputDecoration} />
              </div>
              {errors.username && (
                <span className={styles.errorMessage}>
                  {errors.username.message}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FiMail className={styles.labelIcon} />
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`${styles.input} ${errors.email ? styles.error : ''}`}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
                <div className={styles.inputDecoration} />
              </div>
              {errors.email && (
                <span className={styles.errorMessage}>
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FiLock className={styles.labelIcon} />
                Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Minimum 8 characters required',
                    },
                  })}
                  className={`${styles.input} ${errors.password ? styles.error : ''}`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
                <div className={styles.inputDecoration} />
              </div>
              {errors.password && (
                <span className={styles.errorMessage}>
                  {errors.password.message}
                </span>
              )}
              
              <div className={styles.passwordStrength}>
                <div className={styles.strengthMeter}>
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.strengthSegment} ${
                        i < passStrength.score ? styles.filled : ''
                      }`}
                      style={{
                        background: i < passStrength.score ? passStrength.color : '',
                      }}
                    />
                  ))}
                </div>
                <span
                  className={styles.strengthLabel}
                  style={{ color: passStrength.color }}
                >
                  {passStrength.label}
                </span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FiLock className={styles.labelIcon} />
                Confirm Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  className={`${styles.input} ${
                    errors.confirmPassword ? styles.error : ''
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>
                <div className={styles.inputDecoration} />
              </div>
              {errors.confirmPassword && (
                <span className={styles.errorMessage}>
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>

          {/* Step 2: Restaurant Info */}
          <div className={`${styles.formStep} ${step === 2 ? styles.active : ''}`}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FiHome className={styles.labelIcon} />
                Restaurant Name
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  {...register('name', {
                    required: 'Restaurant name is required',
                    minLength: {
                      value: 2,
                      message: 'Minimum 2 characters required',
                    },
                  })}
                  className={`${styles.input} ${
                    errors.name ? styles.error : ''
                  }`}
                  placeholder="Your Restaurant Name"
                />
                <div className={styles.inputDecoration} />
              </div>
              {errors.name && (
                <span className={styles.errorMessage}>
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FiMapPin className={styles.labelIcon} />
                Address
              </label>
              <div className={styles.inputWrapper}>
                <textarea
                  {...register('address', {
                    required: 'Address is required',
                  })}
                  className={`${styles.input} ${styles.textarea} ${
                    errors.address ? styles.error : ''
                  }`}
                  placeholder="Restaurant address"
                  rows={3}
                />
                <div className={styles.inputDecoration} />
              </div>
              {errors.address && (
                <span className={styles.errorMessage}>
                  {errors.address.message}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FiPhone className={styles.labelIcon} />
                Phone Number
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="tel"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[\d\s\-\+\(\)]+$/,
                      message: 'Please enter a valid phone number',
                    },
                  })}
                  className={`${styles.input} ${
                    errors.phone ? styles.error : ''
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                <div className={styles.inputDecoration} />
              </div>
              {errors.phone && (
                <span className={styles.errorMessage}>
                  {errors.phone.message}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FiFileText className={styles.labelIcon} />
                Description
              </label>
              <div className={styles.inputWrapper}>
                <textarea
                  {...register('description')}
                  className={`${styles.input} ${styles.textarea}`}
                  placeholder="Tell us about your restaurant, cuisine type, etc."
                  rows={4}
                />
                <div className={styles.inputDecoration} />
              </div>
            </div>
          </div>

          {/* Step 3: Confirmation */}
          <div className={`${styles.formStep} ${step === 3 ? styles.active : ''}`}>
            <div className={styles.confirmationContent}>
              <div className={styles.successIcon}>
                <FiCheck size={48} />
              </div>
              <h3 className={styles.confirmationTitle}>Ready to Go!</h3>
              <p className={styles.confirmationText}>
                Review your information before creating your account.
              </p>
              <div className={styles.confirmationDetails}>
                <div className={styles.detailSection}>
                  <h4 className={styles.sectionTitle}>Account Information</h4>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Username:</span>
                    <span className={styles.detailValue}>
                      {userData?.username || watch('username')}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>
                      {userData?.email || watch('email')}
                    </span>
                  </div>
                </div>
                
                <div className={styles.detailSection}>
                  <h4 className={styles.sectionTitle}>Restaurant Information</h4>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Name:</span>
                    <span className={styles.detailValue}>
                      {restaurantData?.name || watch('name')}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Address:</span>
                    <span className={styles.detailValue}>
                      {restaurantData?.address || watch('address')}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Phone:</span>
                    <span className={styles.detailValue}>
                      {restaurantData?.phone || watch('phone')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className={styles.serverError}>
              <FiAlertCircle className={styles.errorIcon} />
              {error}
            </div>
          )}

          <div className={styles.formActions}>
            {step > 1 && (
              <button
                type="button"
                className={styles.backButton}
                onClick={handleBack}
                disabled={isLoading || isSubmitting}
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                className={styles.nextButton}
                onClick={handleNext}
                disabled={isLoading || isSubmitting}
              >
                Continue
                <FiArrowRight className={styles.buttonIcon} />
              </button>
            ) : (
              <button
                type="button"
                className={styles.submitButton}
                onClick={handleCompleteRegistration}
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? (
                  <div className={styles.spinner} />
                ) : (
                  'Complete Registration'
                )}
              </button>
            )}
          </div>
        </div>

        {!isModal && (
          <div className={styles.loginPrompt}>
            Already have an account?{' '}
            <button
              type="button"
              className={styles.loginLink}
              onClick={onLoginClick}
            >
              Sign in here
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Registration;