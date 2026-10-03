import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchApi } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem('hrga_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchApi('/auth/me');
      setUser(data.user);
    } catch (error) {
      console.error('Session expired or invalid token:', error.message);
      localStorage.removeItem('hrga_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Login with email & password -> triggers OTP email
  const initiateLogin = async (email, password) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return data;
  };

  // Step 2: Verify 6-digit OTP code -> issues JWT token
  const verifyOtp = async (email, otpCode) => {
    const data = await fetchApi('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code: otpCode })
    });

    localStorage.setItem('hrga_token', data.token);
    setUser(data.user);
    return data;
  };

  const resendOtp = async (email) => {
    return await fetchApi('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  };

  const logout = () => {
    localStorage.removeItem('hrga_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, initiateLogin, verifyOtp, resendOtp, logout, checkLoggedInUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
