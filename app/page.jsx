'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState('phone'); // phone, otp, success
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  
  const otpRefs = useRef([]);

  // Setup timer
  useEffect(() => {
    let interval;
    if (step === 'otp' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  // Phone input formatting
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    const match = val.match(/(\d{0,5})(\d{0,5})/);
    let formatted = val;
    if (match) {
      formatted = !match[2] ? match[1] : `${match[1]} ${match[2]}`;
    }
    setPhone(formatted);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    const rawPhone = phone.replace(/\D/g, '');
    if (rawPhone.length < 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${rawPhone}` })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setStep('otp');
      setTimeLeft(30);
      setCanResend(false);
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      alert(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // OTP Logic
  const handleOtpChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;

    const newOtp = [...otp];
    newOtp[index] = val.charAt(val.length - 1); // Only take last character
    setOtp(newOtp);

    // Auto-advance
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index]) {
      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      alert('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const rawPhone = phone.replace(/\D/g, '');
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${rawPhone}`, otp: otpCode })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setStep('success');
      // Redirect to dashboard after showing success animation briefly
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to verify OTP');
      // Clear OTP inputs on error for quick retry
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setCanResend(false);
    
    try {
      const rawPhone = phone.replace(/\D/g, '');
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${rawPhone}` })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setTimeLeft(30);
    } catch (err) {
      alert(err.message || 'Failed to resend OTP');
      setCanResend(true);
    } finally {
      setResending(false);
    }
  };

  const goBack = () => {
    setStep('phone');
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <>
      <div className="background-elements">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <main className="login-container">
        <div className="glass-card">
          
          {/* Step 1: Phone Number */}
          <div className={`step ${step === 'phone' ? 'active' : ''}`} style={{ display: step === 'phone' ? 'flex' : 'none' }}>
            <div className="header">
              <h1>Welcome Back</h1>
              <p>Enter your phone number to sign in</p>
            </div>
            
            <form onSubmit={handlePhoneSubmit} className="form">
              <div className="input-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-wrapper">
                  <span className="country-code">+91</span>
                  <input 
                    type="tel" 
                    id="phone" 
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="99999 00000" 
                    autoComplete="tel" 
                    required 
                  />
                </div>
              </div>
              
              <button type="submit" className={`btn primary-btn ${loading && step === 'phone' ? 'loading' : ''}`}>
                <span>Send Code</span>
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>

          {/* Step 2: OTP */}
          <div className={`step ${step === 'otp' ? 'active' : ''}`} style={{ display: step === 'otp' ? 'flex' : 'none' }}>
            <div className="header">
              <button type="button" onClick={goBack} className="back-btn" aria-label="Go back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1>Verify Phone</h1>
              <p>We&apos;ve sent a code to <span className="highlight">+91 {phone}</span></p>
            </div>

            <form onSubmit={handleOtpSubmit} className="form">
              <div className="otp-inputs">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    className="otp-digit"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    inputMode="numeric"
                    required
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>
              
              <button type="submit" className={`btn primary-btn ${loading && step === 'otp' ? 'loading' : ''}`}>
                <span>Verify & Sign In</span>
              </button>

              <div className="resend-wrapper">
                <p>
                  Didn&apos;t receive the code?{' '}
                  <button 
                    type="button" 
                    className="text-btn" 
                    onClick={handleResend}
                    disabled={!canResend || resending}
                  >
                    {resending ? 'Sending...' : canResend ? 'Resend Code' : `Resend in ${timeLeft}s`}
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* Step 3: Success */}
          <div className={`step ${step === 'success' ? 'active' : ''}`} style={{ display: step === 'success' ? 'flex' : 'none' }}>
            <div className="success-content">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1>Verification Successful</h1>
              <p>Redirecting to your dashboard...</p>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
