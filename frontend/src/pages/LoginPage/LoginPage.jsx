import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiEye, FiEyeOff, FiMail, FiLock, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/dashboard');
    }

    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [navigate, location.state]);
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className={styles.loginContainer}>
      <div className={styles.backgroundPattern}></div>
      
      <motion.div 
        className={styles.loginCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.loginHeader}>
          <motion.h1 
            className={styles.loginTitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Restaurant Analytics
          </motion.h1>
          <motion.p 
            className={styles.loginSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Sign in to your account
          </motion.p>
        </div>
        
        <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
          <motion.div 
            className={styles.inputGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label htmlFor="email" className={styles.inputLabel}>
              Email
            </label>
            <div className={styles.inputContainer}>
              {/* FIXED: Changed Mail to FiMail */}
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
            <AnimatePresence>
              {errors.email && (
                <motion.div 
                  className={styles.errorMessage}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {/* FIXED: Changed AlertCircle to FiAlertCircle */}
                  <FiAlertCircle className={styles.errorIcon} />
                  {errors.email.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <motion.div 
            className={styles.inputGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label htmlFor="password" className={styles.inputLabel}>
              Password
            </label>
            <div className={styles.inputContainer}>
              {/* FIXED: Changed Lock to FiLock */}
              <FiLock className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
              >
                {/* FIXED: Changed Eye/EyeOff to FiEye/FiEyeOff */}
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.div 
                  className={styles.errorMessage}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {/* FIXED: Changed AlertCircle to FiAlertCircle */}
                  <FiAlertCircle className={styles.errorIcon} />
                  {errors.password.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <motion.div 
            className={styles.formOptions}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxCheckmark}></span>
              Remember me
            </label>
            <Link to="/forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </motion.div>
          
          <motion.button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className={styles.spinner}></div>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>
        
        <motion.div 
          className={styles.loginFooter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p>
            Don't have an account?{' '}
            <Link to="/register" className={styles.signupLink}>
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;