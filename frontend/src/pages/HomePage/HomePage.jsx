import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiBarChart2,
  FiTrendingUp,
  FiShield,
  FiZap,
  FiArrowRight,
  FiCheck,
} from 'react-icons/fi';
import LoginForm from '../../components/auth/LoginForm/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm/RegisterForm';
import styles from './HomePage.module.css';

const HomePage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeForm, setActiveForm] = useState('login');

  const features = [
    {
      icon: <FiBarChart2 />,
      title: 'Advanced Analytics',
      description: 'Deep insights into your sales performance with AI-powered analytics',
      color: '#6366f1',
    },
    {
      icon: <FiTrendingUp />,
      title: 'Trend Detection',
      description: 'Automatically identify sales patterns and customer preferences',
      color: '#8b5cf6',
    },
    {
      icon: <FiShield />,
      title: 'Data Security',
      description: 'Enterprise-grade security for your sensitive business data',
      color: '#06b6d4',
    },
    {
      icon: <FiZap />,
      title: 'Real-time Updates',
      description: 'Monitor your restaurant performance with live data updates',
      color: '#10b981',
    },
  ];

  const stats = [
    { value: '15,420', label: 'Restaurants Trust Us', suffix: '+' },
    { value: '98.7%', label: 'Customer Satisfaction', suffix: '' },
    { value: '24/7', label: 'Uptime & Support', suffix: '' },
    { value: '45%', label: 'Average Revenue Increase', suffix: '' },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Owner, Bistro Modern',
      content: 'This platform transformed how we understand our business. Revenue increased by 30% in the first month!',
      avatar: 'SC',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Manager, Urban Grill',
      content: 'The anomaly detection saved us during a slow period. We quickly adjusted our menu and recovered sales.',
      avatar: 'MR',
    },
    {
      name: 'Jessica Park',
      role: 'CEO, Cafe Delight',
      content: 'Best investment we made. The insights helped us optimize staffing and reduce waste significantly.',
      avatar: 'JP',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleLoginSuccess = () => {
    window.location.href = '/dashboard';
  };

  const handleRegisterSuccess = () => {
    setActiveForm('login');
    setShowRegister(false);
    setShowLogin(true);
  };

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground} />
        
        <div className={styles.heroContent}>
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={styles.heroTitle}>
              Transform Your Restaurant with{' '}
              <span className={styles.gradientText}>AI-Powered Analytics</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Gain deep insights into your sales, optimize operations, and boost revenue 
              with our advanced restaurant analytics platform.
            </p>
            
            <div className={styles.heroButtons}>
              <motion.button
                className={styles.primaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveForm('register');
                  setShowRegister(true);
                }}
              >
                Start Free Trial
                <FiArrowRight className={styles.buttonIcon} />
              </motion.button>
              
              <motion.button
                className={styles.secondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveForm('login');
                  setShowLogin(true);
                }}
              >
                Sign In
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className={styles.visualCard}>
              <div className={styles.visualHeader}>
                <div className={styles.visualLogo}>🍽️</div>
                <div className={styles.visualTitle}>Dashboard Preview</div>
              </div>
              <div className={styles.visualContent}>
                <div className={styles.visualMetric}>
                  <div className={styles.metricLabel}>Today's Revenue</div>
                  <div className={styles.metricValue}>$2,850.50</div>
                  <div className={styles.metricTrend}>
                    <FiTrendingUp /> +12.5%
                  </div>
                </div>
                <div className={styles.visualChart} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.statsGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className={styles.statCard}
                variants={itemVariants}
              >
                <div className={styles.statValueContainer}>
                  <span className={styles.statValue}>{stat.value}</span>
                  {stat.suffix && (
                    <span className={styles.statSuffix}>{stat.suffix}</span>
                  )}
                </div>
                <p className={styles.statLabel}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.sectionTitle}>
              Everything You Need to Grow Your Restaurant
            </h2>
            <p className={styles.sectionSubtitle}>
              Powerful features designed specifically for restaurant owners and managers
            </p>
          </motion.div>

          <motion.div
            className={styles.featuresGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={styles.featureCard}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <div
                  className={styles.featureIcon}
                  style={{ color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.sectionTitle}>
              Trusted by Restaurant Owners Worldwide
            </h2>
            <p className={styles.sectionSubtitle}>
              See what our customers have to say about their experience
            </p>
          </motion.div>

          <motion.div
            className={styles.testimonialsGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className={styles.testimonialCard}
                variants={itemVariants}
              >
                <div className={styles.testimonialContent}>
                  <p className={styles.testimonialText}>
                    "{testimonial.content}"
                  </p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>
                    {testimonial.avatar}
                  </div>
                  <div className={styles.authorInfo}>
                    <h4 className={styles.authorName}>{testimonial.name}</h4>
                    <p className={styles.authorRole}>{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.ctaTitle}>
              Ready to Transform Your Restaurant?
            </h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of restaurant owners who have increased their revenue 
              with our analytics platform.
            </p>
            
            <div className={styles.ctaFeatures}>
              <div className={styles.ctaFeature}>
                <FiCheck className={styles.featureCheck} />
                <span>14-day free trial</span>
              </div>
              <div className={styles.ctaFeature}>
                <FiCheck className={styles.featureCheck} />
                <span>No credit card required</span>
              </div>
              <div className={styles.ctaFeature}>
                <FiCheck className={styles.featureCheck} />
                <span>Cancel anytime</span>
              </div>
            </div>
            
            <motion.button
              className={styles.ctaButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveForm('register');
                setShowRegister(true);
              }}
            >
              Get Started for Free
              <FiArrowRight className={styles.buttonIcon} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLogo}>
              <div className={styles.logoIcon}>🍽️</div>
              <div className={styles.logoText}>
                <span className={styles.logoPrimary}>Restaurant</span>
                <span className={styles.logoSecondary}>Analytics</span>
              </div>
            </div>
            
            <div className={styles.footerLinks}>
              <div className={styles.linkGroup}>
                <h4>Product</h4>
                <a href="#">Features</a>
                <a href="#">Pricing</a>
                <a href="#">API</a>
              </div>
              <div className={styles.linkGroup}>
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
              </div>
              <div className={styles.linkGroup}>
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact</a>
                <a href="#">Status</a>
              </div>
              <div className={styles.linkGroup}>
                <h4>Legal</h4>
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Security</a>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} Restaurant Analytics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatedModal show={showLogin} onClose={() => setShowLogin(false)}>
        <LoginForm
          onSuccess={handleLoginSuccess}
          onRegisterClick={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      </AnimatedModal>

      <AnimatedModal show={showRegister} onClose={() => setShowRegister(false)}>
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onLoginClick={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      </AnimatedModal>
    </div>
  );
};

// Modal Component
const AnimatedModal = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modalContent}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default HomePage;