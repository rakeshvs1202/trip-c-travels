"use client";

import { useState, useEffect, FormEvent } from 'react';

// Extend the Window interface to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: any; // Using any to avoid importing the full RecaptchaVerifier type
  }
}

import { toast } from 'sonner';
import { auth } from "../../firebase";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  timestamp: string;
  isVerified?: boolean;
  verifiedAt?: string;
}

interface CustomerInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customerData: CustomerData) => void;
}

export default function CustomerInfoPopup({ isOpen, onClose, onSuccess }: CustomerInfoPopupProps) {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [emailError, setEmailError] = useState('');
  const [countdown, setCountdown] = useState(60); // Changed from 30 to 60 seconds
  const [isVerified, setIsVerified] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [lastOtpRequestTime, setLastOtpRequestTime] = useState<number>(0);

  const validateEmail = (email: string) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, email: value }));
    setEmailError(value && !validateEmail(value) ? 'Please enter a valid email address' : '');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const customerData = localStorage.getItem('customerData');
      if (customerData) {
        const customer = JSON.parse(customerData);
        setIsVerified(true);
        onSuccess(customer);
        onClose();
      }
    }
  }, []);

  useEffect(() => {
    // Enforce singleton reCAPTCHA verifier
    if (typeof window !== 'undefined') {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA verified');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
          },
        });
        window.recaptchaVerifier.render();
        setRecaptchaVerifier(window.recaptchaVerifier);
      } else {
        setRecaptchaVerifier(window.recaptchaVerifier);
      }
    }
    // No cleanup: we want singleton for the entire app session
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const requestOtp = async (phoneNumber: string): Promise<ConfirmationResult> => {
    console.log('[requestOtp] Starting OTP request for:', phoneNumber);
    
    try {
      // Validate phone number format first
      if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      // Format phone number with country code
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      console.log('[requestOtp] Formatted phone number:', formattedPhoneNumber);

      // Check if we have a valid reCAPTCHA verifier
      if (!recaptchaVerifier) {
        console.log('[requestOtp] reCAPTCHA verifier not ready, waiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!recaptchaVerifier) {
          console.error('[requestOtp] reCAPTCHA verifier still not ready after waiting');
          throw new Error("Verification service not ready. Please try again.");
        }
      }
      
      // Log reCAPTCHA verifier state
      console.log('[requestOtp] reCAPTCHA verifier state:', {
        hasVerifier: !!recaptchaVerifier,
        windowVerifier: !!window.recaptchaVerifier
      });
      
      // Create a new verifier instance if needed
      let verifier = recaptchaVerifier;
      if (!verifier || !window.recaptchaVerifier) {
        console.log('[requestOtp] Creating new reCAPTCHA verifier');
        // Clear any existing verifier
        if (window.recaptchaVerifier) {
          try { window.recaptchaVerifier.clear(); } catch (e) {}
        }
        
        // Create new verifier
        verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => console.log('[reCAPTCHA] Verified'),
          'expired-callback': () => console.log('[reCAPTCHA] Expired'),
        });
        
        window.recaptchaVerifier = verifier;
        setRecaptchaVerifier(verifier);
      }
      
      // Request the OTP
      console.log('[requestOtp] Sending OTP request to Firebase...');
      
      // Always reuse the singleton verifier
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, verifier);
      console.log('[requestOtp] OTP request successful, confirmation result received');
      setConfirmationResult(result);
      return result;
    } catch (error: any) {
      console.error('[requestOtp] Error in OTP request:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error; // Re-throw to be handled by the caller
    }
  };

  const handleResendOtp = async () => {
    if (isLoading || countdown > 0) return;
    
    try {
      setIsLoading(true);
      console.log('[handleResendOtp] Resending OTP...');
      
      // Get customer data from session storage
      const customerData = sessionStorage.getItem('customerData');
      if (!customerData) {
        throw new Error('Session expired. Please fill out the form again.');
      }
      
      const { phone } = JSON.parse(customerData);
      if (!phone) {
        throw new Error('Phone number not found. Please fill out the form again.');
      }
      
      // Get last request time from session storage
      const lastRequestKey = `otp_last_request_${phone}`;
      const lastRequestTime = parseInt(sessionStorage.getItem(lastRequestKey) || '0', 10);
      
      // Check rate limiting (60 seconds cooldown)
      const COOLDOWN_PERIOD = 60000; // 60 seconds in milliseconds
      const timeSinceLastRequest = Date.now() - lastRequestTime;
      
      if (timeSinceLastRequest < COOLDOWN_PERIOD) {
        const remainingTime = Math.ceil((COOLDOWN_PERIOD - timeSinceLastRequest) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before requesting a new OTP`);
      }
      
      // Clear any existing reCAPTCHA verifier
      if (window.recaptchaVerifier) {
        try { 
          // Instead of clearing, we'll create a new container for reCAPTCHA
          const container = document.getElementById('recaptcha-container');
          if (container) {
            container.innerHTML = ''; // Clear the container
            const newContainer = document.createElement('div');
            newContainer.id = 'recaptcha-container';
            container.parentNode?.insertBefore(newContainer, container);
            container.remove();
          }
        } catch (e) {
          console.warn('Error resetting reCAPTCHA container:', e);
        }
      }
      
      // Request new OTP
      await requestOtp(phone);
      
      // Update last request time in session storage
      sessionStorage.setItem(lastRequestKey, Date.now().toString());
      
      // Reset countdown and update state
      setCountdown(60);
      setLastOtpRequestTime(Date.now());
      
      // Show success message
      toast.success('New OTP sent successfully!', {
        style: {
          background: '#10B981',
          color: '#fff',
          fontSize: '14px',
          padding: '10px 20px',
        },
      });
    } catch (error: any) {
      console.error('[handleResendOtp] Error:', error);
      
      // Handle rate limiting errors specifically
      if (error.code === 'auth/too-many-requests' || 
          error.message.includes('too many attempts') ||
          error.message.includes('quota exceeded')) {
        toast.error('Too many attempts. Please try again later.', {
          style: {
            background: '#EF4444',
            color: '#fff',
            fontSize: '14px',
            padding: '10px 20px',
          },
        });
      } else {
        toast.error(error.message || 'Failed to resend OTP. Please try again.', {
          style: {
            background: '#EF4444',
            color: '#fff',
            fontSize: '14px',
            padding: '10px 20px',
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[handleSendOtp] Form submitted');
    
    if (isLoading) {
      console.log('[handleSendOtp] Operation in progress, ignoring duplicate request');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Validate form data
      const { name, email, phone } = formData;
      const trimmedName = name?.trim() || '';
      const trimmedEmail = email?.trim() || '';
      const trimmedPhone = phone?.trim() || '';
      
      // Validate required fields
      const errors: { [key: string]: string } = {};
      if (!trimmedName) errors.name = 'Name is required';
      if (!trimmedEmail) {
        errors.email = 'Email is required';
      } else if (!validateEmail(trimmedEmail)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!trimmedPhone) {
        errors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(trimmedPhone)) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
      
      if (Object.keys(errors).length > 0) {
        console.log('[handleSendOtp] Form validation errors:', errors);
        // Update error states
        if (errors.email) setEmailError(errors.email);
        throw new Error('Please fix the form errors');
      }
      
      console.log('[handleSendOtp] Form validation passed');
      
      // Create customer data object with proper types
      const customerData: CustomerData = {
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        phone: trimmedPhone,
        timestamp: new Date().toISOString()
      };
      
      console.log('[handleSendOtp] Saving customer data to session storage');
      sessionStorage.setItem('customerData', JSON.stringify(customerData));
      
      // Request OTP
      console.log('[handleSendOtp] Requesting OTP...');
      await requestOtp(customerData.phone);
      
      // Update UI state
      setStep('otp');
      setCountdown(60); // Changed from 30 to 60 seconds
      setOtp('');
      setOtpError('');
      setLastOtpRequestTime(Date.now());
      
          // Show success message with proper TypeScript types
      const toastStyle: React.CSSProperties = {
        background: '#10B981',
        color: '#fff',
        fontSize: '14px',
        padding: '10px 20px',
        borderRadius: '8px',
      };
      
      toast.success('OTP sent successfully!', {
        position: 'top-center',
        duration: 3000,
        style: toastStyle,
      });
      
      // Start countdown
      console.log('[handleSendOtp] Starting OTP resend countdown');
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            console.log('[handleSendOtp] Countdown finished');
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Clean up interval on component unmount
      return () => clearInterval(timer);
      
    } catch (error: any) {
      console.error('[handleSendOtp] Error:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      // Provide more specific error messages
      if (error.message?.includes('network') || error.code?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        position: 'top-center',
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontSize: '14px',
          padding: '10px 20px',
          borderRadius: '8px',
        },
      });
      
      // If reCAPTCHA failed, reset it for next attempt
      if (error.message?.includes('reCAPTCHA') || error.code === 'auth/captcha-check-failed') {
        console.log('[handleSendOtp] Resetting reCAPTCHA due to error');
        if (window.recaptchaVerifier) {
          try { window.recaptchaVerifier.clear(); } catch (e) {}
          delete window.recaptchaVerifier;
          setRecaptchaVerifier(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    
    try {
      // Validate OTP format
      if (!otp || otp.length !== 6) {
        setOtpError('Please enter a valid 6-digit OTP');
        return;
      }

      setIsLoading(true);
      
      // Verify the OTP with Firebase
      if (!confirmationResult) {
        throw new Error('Verification session expired. Please request a new OTP.');
      }
      
      console.log('[handleVerifyOtp] Verifying OTP...');
      await confirmationResult.confirm(otp);
      console.log('[handleVerifyOtp] OTP verification successful');

      // Get customer data from session storage
      const customerData = JSON.parse(sessionStorage.getItem('customerData') || '{}');
      if (!customerData.email) {
        throw new Error('Session expired. Please try again.');
      }

      // Save verified customer data to localStorage
      const verifiedCustomer: CustomerData = { 
        ...customerData, 
        isVerified: true,
        verifiedAt: new Date().toISOString() 
      };
      
      console.log('[handleVerifyOtp] Saving verified customer data to localStorage');
      localStorage.setItem('customerVerified', 'true');
      localStorage.setItem('customerData', JSON.stringify(verifiedCustomer));
      
      // Clear session storage
      sessionStorage.clear();
      
          // Show success message with proper TypeScript types
      const toastStyle: React.CSSProperties = {
        background: '#10B981',
        color: '#fff',
        fontSize: '14px',
        padding: '10px 20px',
        borderRadius: '8px',
      };
      
      toast.success('Verification successful!', {
        position: 'top-center',
        duration: 3000,
        style: toastStyle,
      });
      
      // Update state and notify parent component
      setIsVerified(true);
      onSuccess(verifiedCustomer);
      onClose();
      
    } catch (error: any) {
      console.error('[handleVerifyOtp] Error:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to verify OTP. Please try again.';
      
      // Handle specific Firebase errors
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP has expired. Please request a new one.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Update error state and show error message
      const errorToastStyle: React.CSSProperties = {
        background: '#EF4444',
        color: '#fff',
        fontSize: '14px',
        padding: '10px 20px',
        borderRadius: '8px',
      };
      
      setOtpError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-center',
        duration: 4000,
        style: errorToastStyle,
      });
    } finally {
      setIsLoading(false);
    }
    
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev: number) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [countdown, step]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div id="recaptcha-container" className="hidden" />
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 'form' ? 'Enter Your Details' : 'Verify OTP'}
          </h2>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] focus:border-transparent outline-none" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleEmailChange} onBlur={(e) => {
                setEmailError(e.target.value && !validateEmail(e.target.value) ? 'Please enter a valid email address' : '');
              }} required className={`w-full px-4 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#FF3131] focus:border-transparent outline-none`} />
              {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} maxLength={10} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] focus:border-transparent outline-none" placeholder="10-digit number" />
            </div>
            <button type="submit" className={`w-full bg-[#FF3131] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#E02020] focus:outline-none transition-colors duration-200 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`} disabled={isLoading}>
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">We've sent a 6-digit OTP to your phone. Please enter it below to verify.</p>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">Enter OTP *</label>
              <input id="otp" type="text" value={otp} onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                setOtpError('');
              }} maxLength={6} required className={`w-full text-center text-2xl font-mono tracking-widest p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF3131] transition-all duration-200 ${otpError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`} placeholder="_ _ _ _ _ _" inputMode="numeric" pattern="\d{6}" />
              {otpError && <p className="mt-2 text-sm text-red-600">{otpError}</p>}
              <div className="mt-2 text-sm text-gray-600 flex justify-between">
                <span>Didn't receive OTP?</span>
                <button type="button" onClick={handleResendOtp} disabled={countdown > 0 || isLoading} className={`font-medium ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#FF3131] hover:text-[#E02020] hover:underline'} transition-colors duration-200`}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading || otp.length !== 6} className={`w-full py-3 px-6 rounded-lg font-medium text-white ${otp.length === 6 ? 'bg-[#FF3131] focus:ring-2 focus:ring-[#FF3131] focus:ring-offset-2' : 'bg-gray-400 cursor-not-allowed'} transition-colors duration-200`}>
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
