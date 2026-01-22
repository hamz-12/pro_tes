import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
// FIXED: Specific import from /fi
import { 
  FiEye, 
  FiEyeOff, 
  FiMail, 
  FiLock, 
  FiUser, 
  FiHome, 
  FiAlertCircle, 
  FiCheckCircle 
} from 'react-icons/fi';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    
    setPasswordStrength(strength);
  }, [password]);
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Registration successful!');
      navigate('/login');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return '#ef4444';
    if (passwordStrength <= 50) return '#f59e0b';
    if (passwordStrength <= 75) return '#06b6d4';
    return '#10b981';
  };
  
  return (
    <div className={styles.registerContainer}>
      <div className={styles.backgroundPattern}></div>
      
      <motion.div 
        className={styles.registerCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.registerHeader}>
          <motion.h1 
            className={styles.registerTitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Create Account
          </motion.h1>
          <motion.p 
            className={styles.registerSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Join Restaurant Analytics today
          </motion.p>
          
          <div className={styles.progressIndicator}>
            <div 
              className={`${styles.progressStep} ${currentStep >= 1 ? styles.active : ''}`}
              onClick={() => setCurrentStep(1)}
            >
              1
            </div>
            <div className={styles.progressLine}></div>
            <div 
              className={`${styles.progressStep} ${currentStep >= 2 ? styles.active : ''}`}
              onClick={() => setCurrentStep(2)}
            >
              2
            </div>
            <div className={styles.progressLine}></div>
            <div 
              className={`${styles.progressStep} ${currentStep >= 3 ? styles.active : ''}`}
              onClick={() => setCurrentStep(3)}
            >
              3
            </div>
          </div>
        </div>
        
        <form className={styles.registerForm} onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode='wait'>
            {currentStep === 1 && (
              <motion.div 
                key="step1"
                className={styles.formStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.inputGroup}>
                  <label htmlFor="name" className={styles.inputLabel}>Full Name</label>
                  <div className={styles.inputContainer}>
                    <FiUser className={styles.inputIcon} />
                    <input
                      id="name"
                      type="text"
                      className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                      placeholder="John Doe"
                      {...register('name', { 
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })}
                    />
                  </div>
                  {errors.name && (
                    <div className={styles.errorMessage}>
                      <FiAlertCircle className={styles.errorIcon} />
                      {errors.name.message}
                    </div>
                  )}
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>Email Address</label>
                  <div className={styles.inputContainer}>
                    <FiMail className={styles.inputIcon} />
                    <input
                      id="email"
                      type="email"
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      placeholder="your@email.com"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <div className={styles.errorMessage}>
                      <FiAlertCircle className={styles.errorIcon} />
                      {errors.email.message}
                    </div>
                  )}
                </div>
                
                <motion.button
                  type="button"
                  className={styles.nextButton}
                  onClick={nextStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next
                </motion.button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2"
                className={styles.formStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>Password</label>
                  <div className={styles.inputContainer}>
                    <FiLock className={styles.inputIcon} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                      placeholder="••••••••"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' }
                      })}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {password && (
                    <div className={styles.passwordStrength}>
                      <div className={styles.strengthBar}>
                        <div 
                          className={styles.strengthFill}
                          style={{ 
                            width: `${passwordStrength}%`,
                            backgroundColor: getPasswordStrengthColor()
                          }}
                        ></div>
                      </div>
                      <span className={styles.strengthText} style={{ color: getPasswordStrengthColor() }}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="confirmPassword" className={styles.inputLabel}>Confirm Password</label>
                  <div className={styles.inputContainer}>
                    <FiLock className={styles.inputIcon} />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                      placeholder="••••••••"
                      {...register('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                
                <div className={styles.stepButtons}>
                  <button type="button" className={styles.backButton} onClick={prevStep}>Back</button>
                  <button type="button" className={styles.nextButton} onClick={nextStep}>Next</button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3"
                className={styles.formStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.inputGroup}>
                  <label htmlFor="restaurantName" className={styles.inputLabel}>Restaurant Name</label>
                  <div className={styles.inputContainer}>
                    <FiHome className={styles.inputIcon} />
                    <input
                      id="restaurantName"
                      type="text"
                      className={`${styles.input} ${errors.restaurantName ? styles.inputError : ''}`}
                      placeholder="Your Restaurant"
                      {...register('restaurantName', { 
                        required: 'Restaurant name is required'
                      })}
                    />
                  </div>
                </div>
                
                <div className={styles.termsGroup}>
                  <label className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={() => setAgreeToTerms(!agreeToTerms)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxCheckmark}></span>
                    I agree to the Terms and Privacy Policy
                  </label>
                </div>
                
                <div className={styles.stepButtons}>
                  <button type="button" className={styles.backButton} onClick={prevStep}>Back</button>
                  <button type="submit" className={styles.registerButton} disabled={isLoading || !agreeToTerms}>
                    {isLoading ? <div className={styles.spinner}></div> : 'Create Account'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
        
        <div className={styles.registerFooter}>
          <p>Already have an account? <Link to="/login" className={styles.loginLink}>Sign in</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;