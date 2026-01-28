import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Registration from '../Registration/Registration';
import styles from './RegistrationModal.module.css';

const RegistrationModal = ({ isOpen, onClose, onLoginClick }) => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    onClose();
    navigate('/', { 
      state: { 
        message: 'Registration successful! Please log in with your credentials.' 
      } 
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={onClose}>
              &times;
            </button>
            <Registration
              onSuccess={handleSuccess}
              onLoginClick={onLoginClick}
              isModal={true}
              closeModal={onClose}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegistrationModal;