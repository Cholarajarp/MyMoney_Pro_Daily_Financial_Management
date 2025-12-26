import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthManager = ({ onLogin, onRegister }) => {
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [modalType, setModalType] = useState(null);

  const handleLogin = async (username, password) => {
    setAuthLoading(true);
    setAuthError('');
    const success = await onLogin(username, password);
    if (!success) {
      setAuthError('Login failed. Please check your credentials.');
    }
    setAuthLoading(false);
    return success;
  };

  const handleRegister = async (username, password, email) => {
    setAuthLoading(true);
    setAuthError('');
    const success = await onRegister(username, password, email);
    if (!success) {
      setAuthError('Registration failed. Username may already exist.');
    }
    setAuthLoading(false);
    return success;
  };

  return (
    <AuthLayout modalType={modalType} setModalType={setModalType}>
      {authMode === 'login' ? (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToSignup={() => { setAuthMode('signup'); setAuthError(''); }}
          loading={authLoading}
          error={authError}
          onOpenModal={setModalType}
        />
      ) : (
        <SignupForm
          onRegister={handleRegister}
          onSwitchToLogin={() => { setAuthMode('login'); setAuthError(''); }}
          loading={authLoading}
          error={authError}
          onOpenModal={setModalType}
        />
      )}
    </AuthLayout>
  );
};

export default AuthManager;
