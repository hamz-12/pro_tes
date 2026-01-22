import React from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiGithub, FiTwitter, FiMail, FiGlobe } from 'react-icons/fi';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FiGithub, label: 'GitHub', href: 'https://github.com' },
    { icon: FiTwitter, label: 'Twitter', href: 'https://twitter.com' },
    { icon: FiMail, label: 'Email', href: 'mailto:support@restaurantanalytics.com' },
    { icon: FiGlobe, label: 'Website', href: 'https://restaurantanalytics.com' },
  ];

  const quickLinks = [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Support', href: '/support' },
  ];

  return (
    <motion.footer
      className={styles.footer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className={styles.footerContent}>
        <div className={styles.footerMain}>
          <div className={styles.brandSection}>
            <div className={styles.brandLogo}>
              <div className={styles.logoIcon}>🍽️</div>
              <div className={styles.brandText}>
                <h3 className={styles.brandName}>Restaurant Analytics</h3>
                <p className={styles.brandTagline}>
                  Advanced analytics for modern restaurants
                </p>
              </div>
            </div>
            <p className={styles.brandDescription}>
              Transform your restaurant data into actionable insights with our 
              powerful analytics platform.
            </p>
          </div>

          <div className={styles.linksSection}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Product</h4>
              <ul className={styles.linkList}>
                {quickLinks.slice(0, 3).map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={styles.link}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Legal</h4>
              <ul className={styles.linkList}>
                {quickLinks.slice(3).map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={styles.link}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Connect</h4>
              <div className={styles.socialLinks}>
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className={styles.socialLink}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon size={20} />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p>
              © {currentYear} Restaurant Analytics. Made with{' '}
              <FiHeart className={styles.heartIcon} /> for restaurant owners.
            </p>
            <p className={styles.version}>v1.0.0 • Alpha Release</p>
          </div>

          <div className={styles.statusIndicator}>
            <div className={styles.statusDot} />
            <span className={styles.statusText}>All Systems Operational</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;