'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CustomerInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customerData: any) => void;
}

export default function CustomerInfoPopup({ isOpen, onClose, onSuccess }: CustomerInfoPopupProps) {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, email: value }));
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };
  const [countdown, setCountdown] = useState(30);
  const [isVerified, setIsVerified] = useState(false);

  // Check if user is already verified on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if customer is verified in localStorage
      const customerData = localStorage.getItem('customerData');
      
      if ( customerData) {
        const customer = JSON.parse(customerData);
        setIsVerified(true);
        onSuccess(customer);
        onClose();
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.phone) {
        throw new Error('Please fill in all fields');
      }

      if (!/^\d{10}$/.test(formData.phone)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      if (!validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Prepare customer data
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        timestamp: Date.now()
      };
      
      // Store customer data in sessionStorage
      sessionStorage.setItem('customerData', JSON.stringify(customerData));
      
      // Clear any existing OTP
      sessionStorage.removeItem('otp');
      setOtp('');

      // Send OTP request
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      sessionStorage.setItem('otp', data.otp);
      setStep('otp');
      setCountdown(30);
      toast.success('OTP sent to your email');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    
    try {
      if (!otp || otp.length !== 6) {
        setOtpError('Please enter a valid 6-digit OTP');
        return;
      }

      setIsLoading(true);
      
      // Get customer data from sessionStorage
      const customerData = JSON.parse(sessionStorage.getItem('customerData') || '{}');
      
      if (!customerData.email) {
        throw new Error('Session expired. Please try again.');
      }
      
      const storedOtp = sessionStorage.getItem('otp');
      // Verify OTP with server
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerData.email,
          otp,
          storedOtp,
          customerData: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'OTP verification failed');
      }
      
      // Create verified customer data
      const verifiedCustomer = {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        isVerified: true
      };
      
      // Store verification status in localStorage
      localStorage.setItem('customerVerified', 'true');
      localStorage.setItem('customerData', JSON.stringify(verifiedCustomer));
      
      // Clear OTP and customer data from sessionStorage
      sessionStorage.removeItem('otp');
      sessionStorage.removeItem('customerData');
      
      // Call success handler with customer data
      setIsVerified(true);
      onSuccess(verifiedCustomer);
      onClose();
      toast.success('Verification successful!');
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError(error instanceof Error ? error.message : 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtp('');
    
    try {
      setIsLoading(true);
      
      // Get customer data from sessionStorage
      const customerData = JSON.parse(sessionStorage.getItem('customerData') || '{}');
      
      if (!customerData.email) {
        throw new Error('Session expired. Please refresh and try again.');
      }
      
      // Clear any existing OTP
      sessionStorage.removeItem('otp');
      
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }
      if (data.otp) {
        sessionStorage.setItem('otp', data.otp);
      }
      
      setCountdown(30);
      toast.success('New OTP sent successfully', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          fontSize: '16px',
          padding: '12px 24px',
          borderRadius: '8px',
        },
      });
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prevCountdown => prevCountdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, step]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 'form' ? 'Enter Your Details' : 'Verify OTP'}
          </h2>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                onBlur={(e) => {
                  if (e.target.value && !validateEmail(e.target.value)) {
                    setEmailError('Please enter a valid email address');
                  } else {
                    setEmailError('');
                  }
                }}
                required
                className={`w-full px-4 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#FF3131] focus:border-transparent transition-all duration-200 outline-none`}
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength={10}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] focus:border-transparent transition-all duration-200 outline-none"
                placeholder="10-digit number"
              />
            </div>
            
            <button 
              type="submit" 
              className={`w-full bg-[#FF3131] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#FF3131] focus:outline-none focus:ring-2  focus:ring-offset-2 transition-colors duration-200 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              We've sent a 6-digit OTP to {formData.email}. Please check spam folder andenter it below to verify your email.
            </p>
            
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP *
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setOtpError('');
                }}
                maxLength={6}
                required
                className={`w-full text-center text-2xl font-mono tracking-widest p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF3131] transition-all duration-200 ${
                otpError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
              }`}
                placeholder="_ _ _ _ _ _"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="\d{6}"
              />
              {otpError && (
                <p className="mt-2 text-sm text-red-600">{otpError}</p>
              )}
              
              <div className="mt-2 text-sm text-gray-600 flex justify-between">
                <span>Didn't receive OTP?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className={`font-medium ${
                    countdown > 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-[#FF3131] hover:text-[#E02020] hover:underline'
                  } transition-colors duration-200`}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading || otp.length !== 6}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white ${
                otp.length === 6 
                  ? 'bg-[#FF3131] focus:ring-2 focus:ring-[#FF3131] focus:ring-offset-2' 
                  : 'bg-gray-400 cursor-not-allowed'
              } transition-colors duration-200`}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
