import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiBarChart2,
  FiTrendingUp,
  FiShield,
  FiZap,
  FiArrowRight,
  FiCheck,
  FiPlay,
  FiStar,
  FiUsers,
  FiPieChart,
  FiClock,
  FiGlobe,
  FiSmartphone,
  FiAward,
  FiChevronDown,
  FiX,
  FiMenu,
  FiMapPin,
  FiPhone,
  FiMail,
} from 'react-icons/fi';
import { 
  HiOutlineSparkles, 
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi';
import { BiRestaurant } from 'react-icons/bi';
import { RiRestaurantLine } from 'react-icons/ri';
import LoginForm from '../../components/auth/LoginForm/LoginForm';
import RegistrationModal from '../../components/auth/RegistrationModal/RegistrationModal';
import styles from './HomePage.module.css';

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = '', prefix = '', duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (isInView) {
      const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
      const step = numericValue / (duration * 60);
      let current = 0;
      
      const timer = setInterval(() => {
        current += step;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, 1000 / 60);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);
  
  const formatNumber = (num) => {
    if (value.includes(',')) {
      return Math.floor(num).toLocaleString();
    }
    if (value.includes('.')) {
      return num.toFixed(1);
    }
    return Math.floor(num);
  };
  
  return (
    <span ref={ref}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

// Floating Elements Component
const FloatingElements = () => {
  const elements = [
    { icon: '🍕', delay: 0, duration: 20, x: '10%', y: '20%' },
    { icon: '🍔', delay: 2, duration: 25, x: '85%', y: '15%' },
    { icon: '🍜', delay: 4, duration: 22, x: '75%', y: '70%' },
    { icon: '☕', delay: 1, duration: 18, x: '15%', y: '75%' },
    { icon: '🥘', delay: 3, duration: 23, x: '50%', y: '10%' },
    { icon: '🧆', delay: 5, duration: 21, x: '90%', y: '45%' },
  ];
  
  return (
    <div className={styles.floatingElements}>
      {elements.map((el, index) => (
        <motion.div
          key={index}
          className={styles.floatingIcon}
          style={{ left: el.x, top: el.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {el.icon}
        </motion.div>
      ))}
    </div>
  );
};

// Particle Background Component
const ParticleBackground = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));
  
  return (
    <div className={styles.particleContainer}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={styles.particle}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// Typing Effect Component
const TypeWriter = ({ words, className }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const word = words[currentWordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(word.substring(0, currentText.length + 1));
        if (currentText === word) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setCurrentText(word.substring(0, currentText.length - 1));
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 100);
    
    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words]);
  
  return (
    <span className={className}>
      {currentText}
      <span className={styles.cursor}>|</span>
    </span>
  );
};

// Navbar Component
const Navbar = ({ onLoginClick, onRegisterClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <motion.nav
      className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.navContainer}>
        <div className={styles.navLogo}>
          <motion.div 
            className={styles.logoIconWrapper}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <RiRestaurantLine className={styles.logoIcon} />
          </motion.div>
          <div className={styles.logoText}>
            <span className={styles.logoPrimary}>RestroAnalytics</span>
            <span className={styles.logoTag}>Pakistan</span>
          </div>
        </div>
        
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#how-it-works" className={styles.navLink}>How It Works</a>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
          <a href="#testimonials" className={styles.navLink}>Reviews</a>
          <a href="#contact" className={styles.navLink}>Contact</a>
        </div>
        
        <div className={styles.navActions}>
          <motion.button
            className={styles.navLoginBtn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLoginClick}
          >
            Sign In
          </motion.button>
          <motion.button
            className={styles.navRegisterBtn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRegisterClick}
          >
            <HiOutlineSparkles />
            Start Free
          </motion.button>
        </div>
        
        <button 
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <a href="#features" className={styles.mobileLink}>Features</a>
            <a href="#how-it-works" className={styles.mobileLink}>How It Works</a>
            <a href="#pricing" className={styles.mobileLink}>Pricing</a>
            <a href="#testimonials" className={styles.mobileLink}>Reviews</a>
            <a href="#contact" className={styles.mobileLink}>Contact</a>
            <div className={styles.mobileActions}>
              <button onClick={onLoginClick}>Sign In</button>
              <button onClick={onRegisterClick}>Start Free</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Dashboard Preview Component
const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const salesData = [
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 78 },
    { day: 'Wed', value: 82 },
    { day: 'Thu', value: 70 },
    { day: 'Fri', value: 95 },
    { day: 'Sat', value: 100 },
    { day: 'Sun', value: 88 },
  ];
  
  return (
    <motion.div 
      className={styles.dashboardPreview}
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
    >
      <div className={styles.previewGlow} />
      
      <div className={styles.previewHeader}>
        <div className={styles.previewTabs}>
          {['overview', 'sales', 'menu'].map((tab) => (
            <button
              key={tab}
              className={`${styles.previewTab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.previewDots}>
          <span className={styles.dotRed} />
          <span className={styles.dotYellow} />
          <span className={styles.dotGreen} />
        </div>
      </div>
      
      <div className={styles.previewContent}>
        <div className={styles.previewMetrics}>
          <motion.div 
            className={styles.metricCard}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <HiOutlineCurrencyDollar />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Today's Revenue</span>
              <span className={styles.metricValue}>
                Rs. <AnimatedCounter value="285,500" />
              </span>
              <span className={styles.metricChange}>
                <FiTrendingUp /> +18.5%
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            className={styles.metricCard}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
              <FiUsers />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Orders</span>
              <span className={styles.metricValue}>
                <AnimatedCounter value="156" />
              </span>
              <span className={styles.metricChange}>
                <FiTrendingUp /> +12.3%
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            className={styles.metricCard}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
              <FiPieChart />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Avg. Order Value</span>
              <span className={styles.metricValue}>
                Rs. <AnimatedCounter value="1,830" />
              </span>
              <span className={styles.metricChange}>
                <FiTrendingUp /> +5.2%
              </span>
            </div>
          </motion.div>
        </div>
        
        <div className={styles.previewChart}>
          <div className={styles.chartHeader}>
            <h4>Weekly Sales Overview</h4>
            <span className={styles.chartBadge}>Live</span>
          </div>
          <div className={styles.chartBars}>
            {salesData.map((item, index) => (
              <motion.div
                key={item.day}
                className={styles.chartBar}
                initial={{ height: 0 }}
                whileInView={{ height: `${item.value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <span className={styles.barLabel}>{item.day}</span>
                <motion.div 
                  className={styles.barFill}
                  style={{ height: `${item.value}%` }}
                  whileHover={{ filter: 'brightness(1.2)' }}
                />
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className={styles.previewOrders}>
          <h4>Recent Orders</h4>
          <div className={styles.ordersList}>
            {[
              { id: '#2847', items: 'Biryani, Seekh Kebab', amount: 'Rs. 2,450', status: 'completed' },
              { id: '#2846', items: 'Chicken Karahi, Naan', amount: 'Rs. 3,200', status: 'ready' },
              { id: '#2845', items: 'Beef Pulao, Raita', amount: 'Rs. 1,850', status: 'preparing' },
            ].map((order, index) => (
              <motion.div
                key={order.id}
                className={styles.orderItem}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className={styles.orderId}>{order.id}</span>
                <span className={styles.orderItems}>{order.items}</span>
                <span className={styles.orderAmount}>{order.amount}</span>
                <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                  {order.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Brands Marquee Component
const BrandsMarquee = () => {
  const brands = [
    'Karachi Foods', 'Lahore Biryani House', 'Islamabad Grill', 
    'Peshawar Tikka', 'Multan Cuisine', 'Faisalabad Dine',
    'Rawalpindi Kitchen', 'Quetta Feast'
  ];
  
  return (
    <div className={styles.brandsMarquee}>
      <div className={styles.brandsTrack}>
        {[...brands, ...brands].map((brand, index) => (
          <div key={index} className={styles.brandItem}>
            <RiRestaurantLine />
            <span>{brand}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main HomePage Component
const HomePage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const features = [
    {
      icon: <FiBarChart2 />,
      title: 'Advanced Analytics',
      description: 'Get deep insights into your sales performance with AI-powered analytics designed for Pakistani restaurants.',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    },
    {
      icon: <FiTrendingUp />,
      title: 'Trend Detection',
      description: 'Automatically identify sales patterns, peak hours, and customer preferences across all your branches.',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    },
    {
      icon: <FiShield />,
      title: 'Data Security',
      description: 'Enterprise-grade security with local data hosting in Pakistan. Your business data stays protected.',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
    },
    {
      icon: <FiZap />,
      title: 'Real-time Updates',
      description: 'Monitor your restaurant performance with live data updates. Know what\'s happening right now.',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    },
    {
      icon: <FiSmartphone />,
      title: 'Mobile App',
      description: 'Track your business anywhere with our powerful mobile app. Works offline with auto-sync.',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    },
    {
      icon: <FiGlobe />,
      title: 'Multi-Branch Support',
      description: 'Manage all your branches from a single dashboard. Perfect for restaurant chains across Pakistan.',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
    },
  ];

  const stats = [
    { value: '2,500', label: 'Pakistani Restaurants', suffix: '+' },
    { value: '98.9', label: 'Customer Satisfaction', suffix: '%' },
    { value: '24/7', label: 'Uptime & Support', suffix: '' },
    { value: '45', label: 'Avg Revenue Increase', suffix: '%' },
  ];

  const testimonials = [
    {
      name: 'Ahmed Ali Khan',
      role: 'Owner, Karachi Food Street',
      location: 'Karachi',
      content: 'This platform completely transformed how we understand our business. Our revenue increased by 35% in the first month! The insights are incredibly accurate.',
      avatar: 'AK',
      rating: 5,
    },
    {
      name: 'Fatima Hassan',
      role: 'Manager, Lahore Biryani House',
      location: 'Lahore',
      content: 'Best investment we ever made for our restaurant. Now we know exactly which dishes sell the most and when. The real-time dashboard is a game-changer.',
      avatar: 'FH',
      rating: 5,
    },
    {
      name: 'Umar Farooq',
      role: 'CEO, Peshawari Karahi Chain',
      location: 'Islamabad',
      content: 'The menu optimization feature alone increased our profits by 40%. Managing 5 branches has never been easier. Highly recommended for any restaurant owner!',
      avatar: 'UF',
      rating: 5,
    },
    {
      name: 'Sara Malik',
      role: 'Owner, Taste of Multan',
      location: 'Multan',
      content: 'Real-time analytics helped us make quick decisions during Ramadan rush. The support team is amazing - they even helped us with custom reports.',
      avatar: 'SM',
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '4,999',
      period: '/month',
      description: 'Perfect for small restaurants just getting started',
      features: [
        'Basic Analytics Dashboard',
        '1 Branch / Location',
        'Email Support',
        'Monthly Reports',
        'Mobile App Access',
        '1 User Account',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: '9,999',
      period: '/month',
      description: 'Ideal for growing restaurants and small chains',
      features: [
        'Advanced Analytics & AI Insights',
        'Up to 5 Branches',
        '24/7 Priority Support',
        'Weekly Reports',
        'Mobile App Access',
        'API Access',
        'Staff Management',
        'Inventory Tracking',
        '10 User Accounts',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large chains and franchises',
      features: [
        'Unlimited Branches',
        'AI-Powered Predictions',
        'Dedicated Account Manager',
        'Custom Integrations',
        'On-site Training',
        'SLA Guarantee',
        'White Label Option',
        'Unlimited Users',
        'Custom Reports',
      ],
      popular: false,
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
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      }
    },
  };

  const handleLoginSuccess = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className={styles.homePage}>
      <ParticleBackground />
      
      <Navbar 
        onLoginClick={() => setShowLogin(true)} 
        onRegisterClick={() => setShowRegister(true)} 
      />
      
      {/* Progress Bar */}
      <motion.div 
        className={styles.progressBar}
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Section */}
      <section className={styles.heroSection} ref={heroRef}>
        <FloatingElements />
        <div className={styles.heroBackground}>
          <div className={styles.gradientOrb1} />
          <div className={styles.gradientOrb2} />
          <div className={styles.gradientOrb3} />
          <div className={styles.gridOverlay} />
        </div>
        
        <motion.div 
          className={styles.heroContent}
          style={{ opacity, scale }}
        >
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className={styles.heroBadge}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <HiOutlineSparkles />
              <span>Pakistan's #1 Restaurant Analytics Platform</span>
            </motion.div>
            
            <h1 className={styles.heroTitle}>
              Transform Your Restaurant Into A{' '}
              <span className={styles.gradientText}>
                <TypeWriter 
                  words={['Profitable', 'Data-Driven', 'Successful', 'Smart']} 
                  className={styles.typingText}
                />
              </span>
              {' '}Business
            </h1>
            
            <p className={styles.heroSubtitle}>
              Boost your sales, reduce costs, and make smarter decisions with 
              AI-powered analytics built specifically for Pakistani restaurants.
            </p>
            
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <FiTrendingUp className={styles.statIcon} />
                <span>45% Avg. Growth</span>
              </div>
              <div className={styles.heroStat}>
                <FiUsers className={styles.statIcon} />
                <span>2,500+ Restaurants</span>
              </div>
              <div className={styles.heroStat}>
                <FiStar className={styles.statIcon} />
                <span>4.9 Rating</span>
              </div>
            </div>
            
            <div className={styles.heroButtons}>
              <motion.button
                className={styles.primaryButton}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRegister(true)}
              >
                <HiOutlineSparkles className={styles.buttonIcon} />
                Start Free Trial
                <FiArrowRight className={styles.buttonArrow} />
              </motion.button>
              
              <motion.button
                className={styles.secondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPlay className={styles.playIcon} />
                Watch Demo
              </motion.button>
            </div>
            
            <div className={styles.trustIndicators}>
              <div className={styles.trustItem}>
                <FiCheck className={styles.trustCheck} />
                <span>No credit card required</span>
              </div>
              <div className={styles.trustItem}>
                <FiCheck className={styles.trustCheck} />
                <span>14-day free trial</span>
              </div>
              <div className={styles.trustItem}>
                <FiCheck className={styles.trustCheck} />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>

          <div className={styles.heroVisual}>
            <DashboardPreview />
          </div>
        </motion.div>
        
        <motion.div 
          className={styles.scrollIndicator}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FiChevronDown />
          <span>Scroll to explore</span>
        </motion.div>
      </section>

      {/* Brands Marquee */}
      <section className={styles.brandsSection}>
        <div className={styles.container}>
          <p className={styles.brandsTitle}>Trusted by 2,500+ restaurants across Pakistan</p>
          <BrandsMarquee />
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
            viewport={{ once: true, margin: "-100px" }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className={styles.statCard}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <div className={styles.statValueContainer}>
                  <AnimatedCounter 
                    value={stat.value} 
                    suffix={stat.suffix}
                  />
                </div>
                <p className={styles.statLabel}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection} id="features">
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className={styles.sectionBadge}>
              <HiOutlineLightningBolt /> Features
            </span>
            <h2 className={styles.sectionTitle}>
              Everything You Need To
              <br />
              <span className={styles.gradientText}>Grow Your Restaurant</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Powerful features designed specifically for Pakistani restaurant owners and managers
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
                whileHover={{ 
                  y: -10, 
                  transition: { duration: 0.3 },
                }}
              >
                <div className={styles.featureGlow} style={{ background: feature.gradient }} />
                <motion.div
                  className={styles.featureIcon}
                  style={{ background: feature.gradient }}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
                <motion.a 
                  href="#" 
                  className={styles.featureLink}
                  whileHover={{ x: 5 }}
                >
                  Learn more <FiArrowRight />
                </motion.a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection} id="how-it-works">
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className={styles.sectionBadge}>
              <FiZap /> How It Works
            </span>
            <h2 className={styles.sectionTitle}>
              Get Started In
              <br />
              <span className={styles.gradientText}>3 Simple Steps</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Setting up takes less than 5 minutes. Start seeing insights immediately.
            </p>
          </motion.div>

          <div className={styles.stepsContainer}>
            {[
              {
                step: '01',
                title: 'Sign Up Free',
                description: 'Create your free account and add your restaurant details. No credit card required.',
                icon: <FiUsers />,
              },
              {
                step: '02',
                title: 'Connect Your POS',
                description: 'Easily integrate with popular POS systems used in Pakistan or enter data manually.',
                icon: <FiGlobe />,
              },
              {
                step: '03',
                title: 'Grow Your Business',
                description: 'Get actionable insights, make data-driven decisions, and watch your revenue grow.',
                icon: <FiTrendingUp />,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className={styles.stepCard}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className={styles.stepNumber}>{item.step}</div>
                <div className={styles.stepIcon}>{item.icon}</div>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepDescription}>{item.description}</p>
                {index < 2 && <div className={styles.stepConnector} />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className={styles.dashboardSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className={styles.sectionBadge}>
              <HiOutlineChartBar /> Dashboard
            </span>
            <h2 className={styles.sectionTitle}>
              Powerful Dashboard
              <br />
              <span className={styles.gradientText}>Built for Pakistani Restaurants</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Track everything from daily sales to menu performance in one beautiful interface
            </p>
          </motion.div>
          
          <motion.div 
            className={styles.dashboardShowcase}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.showcaseGlow} />
            <div className={styles.showcaseFrame}>
              <div className={styles.showcaseHeader}>
                <div className={styles.showcaseDots}>
                  <span />
                  <span />
                  <span />
                </div>
                <div className={styles.showcaseUrl}>app.restroanalytics.pk/dashboard</div>
              </div>
              <div className={styles.showcaseContent}>
                <div className={styles.showcaseGrid}>
                  <div className={styles.showcaseMetric}>
                    <span className={styles.showcaseLabel}>Today's Sales</span>
                    <span className={styles.showcaseValue}>Rs. 485,200</span>
                    <span className={styles.showcaseTrend}>+23% from yesterday</span>
                  </div>
                  <div className={styles.showcaseMetric}>
                    <span className={styles.showcaseLabel}>Orders</span>
                    <span className={styles.showcaseValue}>234</span>
                    <span className={styles.showcaseTrend}>+18% from yesterday</span>
                  </div>
                  <div className={styles.showcaseMetric}>
                    <span className={styles.showcaseLabel}>Avg. Order Value</span>
                    <span className={styles.showcaseValue}>Rs. 2,073</span>
                    <span className={styles.showcaseTrend}>+5% from yesterday</span>
                  </div>
                  <div className={styles.showcaseMetric}>
                    <span className={styles.showcaseLabel}>Top Item</span>
                    <span className={styles.showcaseValue}>Chicken Biryani</span>
                    <span className={styles.showcaseTrend}>67 orders today</span>
                  </div>
                </div>
                <div className={styles.showcaseChart}>
                  <div className={styles.chartPlaceholder}>
                    {[65, 80, 45, 90, 75, 85, 95].map((height, i) => (
                      <motion.div
                        key={i}
                        className={styles.chartBarDemo}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className={styles.pricingSection} id="pricing">
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className={styles.sectionBadge}>
              <HiOutlineCurrencyDollar /> Pricing
            </span>
            <h2 className={styles.sectionTitle}>
              Simple, Transparent
              <br />
              <span className={styles.gradientText}>Pricing Plans</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Choose the plan that fits your restaurant. All prices in PKR. Cancel anytime.
            </p>
          </motion.div>

          <motion.div
            className={styles.pricingGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`${styles.pricingCard} ${plan.popular ? styles.popularPlan : ''}`}
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>
                    <FiStar /> Most Popular
                  </div>
                )}
                <div className={styles.planHeader}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPrice}>
                    {plan.price !== 'Custom' && <span className={styles.currency}>Rs.</span>}
                    <span className={styles.amount}>{plan.price}</span>
                    <span className={styles.period}>{plan.period}</span>
                  </div>
                  <p className={styles.planDescription}>{plan.description}</p>
                </div>
                <ul className={styles.planFeatures}>
                  {plan.features.map((feature, idx) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <FiCheck className={styles.checkIcon} />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  className={`${styles.planButton} ${plan.popular ? styles.popularButton : ''}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRegister(true)}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                  <FiArrowRight />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.p 
            className={styles.pricingNote}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            All plans include a 14-day free trial. No credit card required.
          </motion.p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection} id="testimonials">
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className={styles.sectionBadge}>
              <FiStar /> Testimonials
            </span>
            <h2 className={styles.sectionTitle}>
              What Our Customers
              <br />
              <span className={styles.gradientText}>Are Saying</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Join thousands of restaurant owners who have transformed their business
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
                whileHover={{ y: -10 }}
              >
                <div className={styles.testimonialRating}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className={styles.starIcon} />
                  ))}
                </div>
                <p className={styles.testimonialText}>
                  "{testimonial.content}"
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>
                    {testimonial.avatar}
                  </div>
                  <div className={styles.authorInfo}>
                    <h4 className={styles.authorName}>{testimonial.name}</h4>
                    <p className={styles.authorRole}>{testimonial.role}</p>
                    <span className={styles.authorLocation}>
                      <FiMapPin /> {testimonial.location}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className={styles.sectionBadge}>
              <HiOutlineLightningBolt /> FAQ
            </span>
            <h2 className={styles.sectionTitle}>
              Frequently Asked
              <br />
              <span className={styles.gradientText}>Questions</span>
            </h2>
          </motion.div>

          <div className={styles.faqGrid}>
            {[
              {
                q: 'Do I need special hardware to use RestroAnalytics?',
                a: 'No! RestroAnalytics works on any device with a web browser. You can use it on your existing computer, tablet, or smartphone.',
              },
              {
                q: 'Can I integrate with my existing POS system?',
                a: 'Yes! We support integration with most popular POS systems in Pakistan including FoodPanda, Cheetay, and local POS solutions. You can also enter data manually.',
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. We use enterprise-grade encryption and our servers are hosted in secure data centers. Your business data is always protected.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major Pakistani banks, JazzCash, EasyPaisa, and credit/debit cards. All payments are processed securely in PKR.',
              },
              {
                q: 'Can I manage multiple branches?',
                a: 'Yes! Our Professional and Enterprise plans support multiple branches. You can view consolidated reports or drill down into individual locations.',
              },
              {
                q: 'Do you offer training and support?',
                a: 'Yes! All plans include email support and access to our help center. Professional plans get 24/7 priority support, and Enterprise plans include dedicated account managers.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className={styles.faqItem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className={styles.faqQuestion}>{faq.q}</h4>
                <p className={styles.faqAnswer}>{faq.a}</p>
              </motion.div>
            ))}
          </div>
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
            <div className={styles.ctaBackground}>
              <div className={styles.ctaOrb1} />
              <div className={styles.ctaOrb2} />
            </div>
            
            <motion.div
              className={styles.ctaIcon}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <RiRestaurantLine />
            </motion.div>
            
            <h2 className={styles.ctaTitle}>
              Ready to Transform Your
              <br />
              <span className={styles.gradientText}>Restaurant Business?</span>
            </h2>
            <p className={styles.ctaSubtitle}>
              Join 2,500+ Pakistani restaurants that have increased their revenue by an average of 45%.
              Start your free trial today - no credit card required.
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
            
            <div className={styles.ctaButtons}>
              <motion.button
                className={styles.ctaButton}
                whileHover={{ scale: 1.05, boxShadow: "0 30px 60px rgba(99, 102, 241, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRegister(true)}
              >
                <HiOutlineSparkles />
                Start Your Free Trial
                <FiArrowRight className={styles.buttonArrow} />
              </motion.button>
              
              <motion.button
                className={styles.ctaSecondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPhone />
                Schedule a Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer} id="contact">
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <RiRestaurantLine className={styles.footerLogoIcon} />
                <div className={styles.footerLogoText}>
                  <span className={styles.logoPrimary}>RestroAnalytics</span>
                  <span className={styles.logoTag}>Pakistan</span>
                </div>
              </div>
              <p className={styles.footerDescription}>
                Pakistan's leading restaurant analytics platform. 
                Make data-driven decisions and grow your restaurant business.
              </p>
              <div className={styles.footerContact}>
                <a href="mailto:hello@restroanalytics.pk">
                  <FiMail /> hello@restroanalytics.pk
                </a>
                <a href="tel:+923001234567">
                  <FiPhone /> +92 300 123 4567
                </a>
                <span>
                  <FiMapPin /> Karachi, Pakistan
                </span>
              </div>
              <div className={styles.socialLinks}>
                <a href="#" aria-label="Facebook">FB</a>
                <a href="#" aria-label="Twitter">TW</a>
                <a href="#" aria-label="Instagram">IG</a>
                <a href="#" aria-label="LinkedIn">LI</a>
              </div>
            </div>
            
            <div className={styles.footerLinks}>
              <div className={styles.linkGroup}>
                <h4>Product</h4>
                <a href="#">Features</a>
                <a href="#">Pricing</a>
                <a href="#">Integrations</a>
                <a href="#">Mobile App</a>
                <a href="#">API Docs</a>
              </div>
              <div className={styles.linkGroup}>
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
                <a href="#">Press Kit</a>
                <a href="#">Partners</a>
              </div>
              <div className={styles.linkGroup}>
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
                <a href="#">System Status</a>
                <a href="#">FAQ</a>
                <a href="#">Community</a>
              </div>
              <div className={styles.linkGroup}>
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
                <a href="#">Data Security</a>
                <a href="#">Compliance</a>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} RestroAnalytics Pakistan. All rights reserved.
            </p>
            <div className={styles.footerBadges}>
              <span>🔒 SSL Secured</span>
              <span>🇵🇰 Made in Pakistan</span>
              <span>💚 Trusted by 2,500+ Restaurants</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showLogin && (
          <AnimatedModal onClose={() => setShowLogin(false)}>
            <LoginForm
              onSuccess={handleLoginSuccess}
              onRegisterClick={() => {
                setShowLogin(false);
                setShowRegister(true);
              }}
            />
          </AnimatedModal>
        )}
      </AnimatePresence>

      <RegistrationModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onLoginClick={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </div>
  );
};

// Modal Component
const AnimatedModal = ({ onClose, children }) => {
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
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.modalClose} onClick={onClose}>
          <FiX />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default HomePage;