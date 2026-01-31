import React from 'react';
import { useNavigate } from 'react-router-dom';
import Registration from '../../components/auth/Registration/Registration';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    navigate('/login', { 
      state: { 
        message: 'Registration successful! Please log in with your credentials.' 
      } 
    });
  };
  
  const handleLoginClick = () => {
    navigate('/login');
  };
  
  return (
    <div className={styles.registerPageContainer}>
      <Registration 
        onSuccess={handleSuccess} 
        onLoginClick={handleLoginClick}
        isModal={false}
      />
    </div>
  );
};

export default RegisterPage;