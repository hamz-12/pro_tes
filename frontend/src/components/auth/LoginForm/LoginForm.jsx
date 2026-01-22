import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import styles from './LoginForm.module.css';

const LoginForm = ({ onSuccess, onRegisterClick }) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'An unexpected error occurred';
      setError(message);
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

  return (
    <motion.div
      className={styles.loginContainer}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
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
              <FiLogIn size={32} />
            </div>
          </motion.div>
          <motion.h1 variants={itemVariants} className={styles.title}>
            Welcome Back
          </motion.h1>
          <motion.p variants={itemVariants} className={styles.subtitle}>
            Sign in to access your restaurant analytics dashboard
          </motion.p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
                placeholder="Enter your email"
                autoComplete="email"
              />
              <div className={styles.inputDecoration} />
            </div>
            {errors.email && (
              <motion.span
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={styles.errorMessage}
              >
                {errors.email.message}
              </motion.span>
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
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={`${styles.input} ${errors.password ? styles.error : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
              <div className={styles.inputDecoration} />
            </div>
            {errors.password && (
              <motion.span
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={styles.errorMessage}
              >
                {errors.password.message}
              </motion.span>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className={styles.options}>
            <label className={styles.rememberMe}>
              <input type="checkbox" {...register('remember')} />
              <span className={styles.checkbox} />
              Remember me
            </label>
            <button type="button" className={styles.forgotPassword}>
              Forgot password?
            </button>
          </motion.div>

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

          <motion.button
            variants={itemVariants}
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className={styles.spinner} />
            ) : (
              <>
                Sign In
                <FiLogIn className={styles.buttonIcon} />
              </>
            )}
          </motion.button>

          <motion.div variants={itemVariants} className={styles.divider}>
            <span>or</span>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.registerPrompt}>
            Don't have an account?{' '}
            <button
              type="button"
              className={styles.registerLink}
              onClick={onRegisterClick}
            >
              Create one now
            </button>
          </motion.div>
        </form>

        <motion.div
          variants={itemVariants}
          className={styles.backgroundPattern}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={styles.patternDot}
              style={{
                animationDelay: `${i * 0.1}s`,
                left: `${(i % 5) * 20}%`,
                top: `${Math.floor(i / 5) * 20}%`,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoginForm;