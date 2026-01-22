import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiMail, FiCheck, FiArrowLeft, FiLock } from 'react-icons/fi';
import styles from './PasswordReset.module.css';

const PasswordReset = ({ onBackToLogin, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('newPassword');

  const handleSendReset = async (data) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEmail(data.email);
      setStep(2);
      setIsLoading(false);
    }, 1500);
  };

  const handleResetPassword = async (data) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStep(3);
      setIsLoading(false);
      if (onSuccess) onSuccess();
    }, 1500);
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

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={styles.resetContainer}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className={styles.glassCard}>
        <button className={styles.backButton} onClick={onBackToLogin}>
          <FiArrowLeft size={20} />
          Back to Login
        </button>

        <div className={styles.header}>
          <motion.div variants={itemVariants} className={styles.logo}>
            <div className={styles.logoIcon}>
              <FiLock size={32} />
            </div>
          </motion.div>
          <motion.h1 variants={itemVariants} className={styles.title}>
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Create New Password'}
            {step === 3 && 'Password Reset Successful'}
          </motion.h1>
          <motion.p variants={itemVariants} className={styles.subtitle}>
            {step === 1 && 'Enter your email to receive a reset link'}
            {step === 2 && 'Create a new password for your account'}
            {step === 3 && 'Your password has been reset successfully'}
          </motion.p>
        </div>

        {step === 1 && (
          <motion.form
            onSubmit={handleSubmit(handleSendReset)}
            className={styles.form}
            variants={itemVariants}
          >
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

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className={styles.spinner} />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            onSubmit={handleSubmit(handleResetPassword)}
            className={styles.form}
            variants={itemVariants}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className={styles.emailDisplay}>
              <FiMail className={styles.emailIcon} />
              <span>{email}</span>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <FiLock className={styles.labelIcon} />
                New Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="password"
                  {...register('newPassword', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Minimum 8 characters required',
                    },
                  })}
                  className={`${styles.input} ${
                    errors.newPassword ? styles.error : ''
                  }`}
                  placeholder="Create a new password"
                />
                <div className={styles.inputDecoration} />
              </div>
              {errors.newPassword && (
                <span className={styles.errorMessage}>
                  {errors.newPassword.message}
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
                Confirm New Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  className={`${styles.input} ${
                    errors.confirmPassword ? styles.error : ''
                  }`}
                  placeholder="Confirm your new password"
                />
                <div className={styles.inputDecoration} />
              </div>
              {errors.confirmPassword && (
                <span className={styles.errorMessage}>
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className={styles.spinner} />
              ) : (
                'Reset Password'
              )}
            </button>
          </motion.form>
        )}

        {step === 3 && (
          <motion.div
            className={styles.successContent}
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={styles.successIcon}>
              <FiCheck size={48} />
            </div>
            <h3 className={styles.successTitle}>Password Reset Successful!</h3>
            <p className={styles.successText}>
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>
            <button
              className={styles.loginButton}
              onClick={onBackToLogin}
            >
              Back to Login
            </button>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className={styles.tips}>
          <h4 className={styles.tipsTitle}>Password Tips:</h4>
          <ul className={styles.tipsList}>
            <li>Use at least 8 characters</li>
            <li>Include uppercase and lowercase letters</li>
            <li>Add numbers and special characters</li>
            <li>Avoid using personal information</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PasswordReset;