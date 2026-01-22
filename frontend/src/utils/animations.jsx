import { motion } from 'framer-motion';

/**
 * Page transition animations
 */
export const pageTransitions = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * Fade in animation
 */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Slide in from left animation
 */
export const slideInLeft = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
};

/**
 * Slide in from right animation
 */
export const slideInRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
};

/**
 * Slide in from bottom animation
 */
export const slideInUp = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 100, opacity: 0 },
};

/**
 * Scale in animation
 */
export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

/**
 * Stagger children animation
 */
export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

/**
 * Stagger children with fade up
 */
export const staggerFadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * Button hover animation
 */
export const buttonHover = {
  scale: 1.05,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  },
};

/**
 * Button tap animation
 */
export const buttonTap = {
  scale: 0.95,
};

/**
 * Card hover animation
 */
export const cardHover = {
  y: -8,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
};

/**
 * Icon hover animation
 */
export const iconHover = {
  rotate: 360,
  transition: {
    duration: 0.6,
    ease: 'easeInOut',
  },
};

/**
 * Loading spinner animation
 */
export const loadingSpinner = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

/**
 * Pulse animation
 */
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

/**
 * Shake animation for errors
 */
export const shake = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

/**
 * Bounce animation
 */
export const bounce = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Flip animation
 */
export const flip = {
  initial: { rotateY: 90 },
  animate: { rotateY: 0 },
  exit: { rotateY: 90 },
};

/**
 * Draw SVG path animation
 */
export const drawPath = {
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: {
    duration: 2,
    ease: 'easeInOut',
  },
};

/**
 * Text reveal animation
 */
export const textReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.6,
    ease: [0.25, 0.1, 0.25, 1],
  },
};

/**
 * Glass morphism hover effect
 */
export const glassHover = {
  initial: {
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  animate: {
    backdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

/**
 * Gradient shift animation
 */
export const gradientShift = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

/**
 * Create a motion component with animation
 * @param {string} component - HTML element type
 * @param {Object} animation - Animation configuration
 * @returns {React.Component} - Motion component
 */
export const createAnimatedComponent = (component = 'div', animation = fadeIn) => {
  return motion[component] ? motion[component].extend(animation) : motion.div.extend(animation);
};

/**
 * Generate spring animation config
 * @param {Object} config - Spring configuration
 * @returns {Object} - Spring config
 */
export const springConfig = (config = {}) => ({
  type: 'spring',
  stiffness: 300,
  damping: 25,
  ...config,
});

/**
 * Generate ease animation config
 * @param {string} ease - Easing function
 * @param {number} duration - Animation duration
 * @returns {Object} - Transition config
 */
export const easeConfig = (ease = 'easeInOut', duration = 0.3) => ({
  duration,
  ease,
});

/**
 * Create staggered animation for list items
 * @param {number} staggerDelay - Delay between items
 * @param {number} initialDelay - Initial delay
 * @returns {Object} - Animation variants
 */
export const createStaggerAnimation = (staggerDelay = 0.1, initialDelay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: initialDelay + i * staggerDelay,
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
  exit: { opacity: 0, y: -20 },
});

/**
 * Create attention seeker animation
 * @param {string} type - Animation type ('pulse', 'bounce', 'shake', 'tada')
 * @returns {Object} - Animation variants
 */
export const createAttentionSeeker = (type = 'pulse') => {
  const animations = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
    bounce: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        repeat: Infinity,
      },
    },
    shake: {
      x: [0, -5, 5, -5, 5, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
    tada: {
      scale: [1, 0.9, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1],
      rotate: [0, -3, -3, 3, -3, 3, -3, 3, -3, 0],
      transition: {
        duration: 1,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  };

  return animations[type] || animations.pulse;
};

/**
 * Create parallax scroll animation
 * @param {number} speed - Parallax speed factor
 * @returns {Function} - Parallax style function
 */
export const createParallax = (speed = 0.5) => {
  return {
    style: {
      transform: `translateY(${speed * 100}px)`,
    },
  };
};

/**
 * Create typing animation for text
 * @param {string} text - Text to animate
 * @param {number} speed - Typing speed in seconds per character
 * @returns {Object} - Animation variants
 */
export const createTypingAnimation = (text, speed = 0.05) => ({
  initial: { width: 0 },
  animate: {
    width: '100%',
    transition: {
      duration: text.length * speed,
      ease: 'linear',
    },
  },
});

/**
 * Create marquee animation
 * @param {number} duration - Duration of one loop
 * @returns {Object} - Animation variants
 */
export const createMarquee = (duration = 20) => ({
  animate: {
    x: ['0%', '-100%'],
    transition: {
      duration,
      ease: 'linear',
      repeat: Infinity,
    },
  },
});

/**
 * Create wave animation
 * @param {number} amplitude - Wave amplitude
 * @param {number} frequency - Wave frequency
 * @returns {Object} - Animation variants
 */
export const createWave = (amplitude = 10, frequency = 2) => ({
  animate: {
    y: [0, -amplitude, 0, amplitude, 0],
    transition: {
      duration: 1 / frequency,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
});

/**
 * Create ripple animation
 * @param {number} scale - Maximum scale
 * @returns {Object} - Animation variants
 */
export const createRipple = (scale = 1.5) => ({
  initial: { scale: 0, opacity: 1 },
  animate: {
    scale: scale,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
});

/**
 * Combine multiple animations
 * @param {...Object} animations - Animations to combine
 * @returns {Object} - Combined animation
 */
export const combineAnimations = (...animations) => {
  return animations.reduce((combined, animation) => {
    return {
      ...combined,
      ...animation,
      transition: {
        ...combined.transition,
        ...animation.transition,
      },
    };
  }, {});
};

/**
 * Generate random animation for decorative elements
 * @returns {Object} - Random animation
 */
export const randomAnimation = () => {
  const animations = [
    pulse,
    bounce,
    createWave(5, 1),
    createAttentionSeeker('tada'),
  ];
  
  return animations[Math.floor(Math.random() * animations.length)];
};