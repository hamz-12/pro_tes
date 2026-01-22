import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import styles from './RegisterForm.module.css';

const RegisterForm = ({ onSuccess, onLoginClick }) => {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
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
      const isValid = await trigger(['email', 'password', 'confirmPassword']);
      if (isValid) setStep(2);
    } else if (step === 2) {
      const isValid = await trigger(['restaurant_name']);
      if (isValid) setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await registerUser({
        email: data.email,
        password: data.password,
        restaurant_name: data.restaurant_name,
      });

      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(result.error?.response?.data?.detail || 'Registration failed');
        setStep(1);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
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
      className={styles.registerContainer}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <motion.div variants={itemVariants} className={styles.logo}>
            <div className={styles.logoIcon}>
              <FiUser size={32} />
            </div>
          </motion.div>
          <motion.h1 variants={itemVariants} className={styles.title}>
            Create Account
          </motion.h1>
          <motion.p variants={itemVariants} className={styles.subtitle}>
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

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                className={styles.formStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <motion.div variants={itemVariants} className={styles.inputGroup}>
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
                </motion.div>

                <motion.div variants={itemVariants} className={styles.inputGroup}>
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
                </motion.div>

                <motion.div variants={itemVariants} className={styles.inputGroup}>
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
                </motion.div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                className={styles.formStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <motion.div variants={itemVariants} className={styles.inputGroup}>
                  <label className={styles.label}>
                    <FiHome className={styles.labelIcon} />
                    Restaurant Name
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      {...register('restaurant_name', {
                        required: 'Restaurant name is required',
                        minLength: {
                          value: 2,
                          message: 'Minimum 2 characters required',
                        },
                      })}
                      className={`${styles.input} ${
                        errors.restaurant_name ? styles.error : ''
                      }`}
                      placeholder="Your Restaurant Name"
                    />
                    <div className={styles.inputDecoration} />
                  </div>
                  {errors.restaurant_name && (
                    <span className={styles.errorMessage}>
                      {errors.restaurant_name.message}
                    </span>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className={styles.inputGroup}>
                  <label className={styles.label}>
                    <FiMail className={styles.labelIcon} />
                    Restaurant Email (Optional)
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="email"
                      {...register('restaurant_email')}
                      className={styles.input}
                      placeholder="restaurant@email.com"
                    />
                    <div className={styles.inputDecoration} />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      {...register('terms', {
                        required: 'You must accept the terms and conditions',
                      })}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.customCheckbox} />
                    I agree to the{' '}
                    <button type="button" className={styles.linkButton}>
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className={styles.linkButton}>
                      Privacy Policy
                    </button>
                  </label>
                  {errors.terms && (
                    <span className={styles.errorMessage}>
                      {errors.terms.message}
                    </span>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      {...register('newsletter')}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.customCheckbox} />
                    Subscribe to our newsletter for updates and tips
                  </label>
                </motion.div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                className={styles.formStep}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <motion.div
                  variants={itemVariants}
                  className={styles.confirmationContent}
                >
                  <div className={styles.successIcon}>
                    <FiCheck size={48} />
                  </div>
                  <h3 className={styles.confirmationTitle}>Ready to Go!</h3>
                  <p className={styles.confirmationText}>
                    Your account has been created successfully. You can now access
                    our restaurant analytics platform and start gaining insights.
                  </p>
                  <div className={styles.confirmationDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Email:</span>
                      <span className={styles.detailValue}>
                        {watch('email')}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Restaurant:</span>
                      <span className={styles.detailValue}>
                        {watch('restaurant_name')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={styles.serverError}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className={styles.formActions}>
            {step > 1 && (
              <button
                type="button"
                className={styles.backButton}
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                className={styles.nextButton}
                onClick={handleNext}
                disabled={isLoading}
              >
                Continue
                <FiArrowRight className={styles.buttonIcon} />
              </button>
            ) : (
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={styles.spinner} />
                ) : (
                  'Complete Registration'
                )}
              </button>
            )}
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className={styles.loginPrompt}>
          Already have an account?{' '}
          <button
            type="button"
            className={styles.loginLink}
            onClick={onLoginClick}
          >
            Sign in here
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RegisterForm;