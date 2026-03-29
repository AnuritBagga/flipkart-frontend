import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const AuthPage = () => {
  const { signInWithGoogle, signInWithPhone, verifyOtp, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // login | signup | phone | otp | email-login
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // redirect happens via OAuth
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const handlePhoneSend = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) { toast.error('Enter a valid phone number'); return; }
    try {
      setLoading(true);
      await signInWithPhone('+91' + phone.replace(/^\+91/, ''));
      setMode('otp');
      toast.success('OTP sent!');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await verifyOtp('+91' + phone, otp);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmail(email, password);
      toast.success('Logged in!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signUpWithEmail(email, password, name);
      toast.success('Account created! Check your email to verify.');
      setMode('email-login');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        {/* Left Panel */}
        <div className="auth-left">
          <h2 className="auth-title">
            {mode === 'signup' ? 'Looks like you\'re new here!' : 'Login'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'signup'
              ? 'Sign up with your mobile number to get started'
              : 'Get access to your Orders, Wishlist and Recommendations'}
          </p>
          <img
            src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png"
            alt="login"
            className="auth-illustration"
          />
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          {mode === 'login' && (
            <>
              <div className="auth-tabs">
                <button className="auth-tab active">Mobile</button>
                <button className="auth-tab" onClick={() => setMode('email-login')}>Email</button>
              </div>

              <form onSubmit={handlePhoneSend} className="auth-form">
                <div className="phone-input-wrap">
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    className="auth-input phone-input"
                    placeholder="Enter Mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                  />
                </div>
                <p className="auth-terms">
                  By continuing, you agree to Flipkart's{' '}
                  <a href="#terms" className="auth-link">Terms of Use</a> and{' '}
                  <a href="#privacy" className="auth-link">Privacy Policy</a>.
                </p>
                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Request OTP'}
                </button>
              </form>

              <div className="auth-divider"><span>OR</span></div>

              <button className="auth-btn-google" onClick={handleGoogle} disabled={loading}>
                <img src="https://www.google.com/favicon.ico" alt="Google" width="18" />
                Continue with Google
              </button>

              <div className="auth-signup-link">
                New to Flipkart?{' '}
                <button className="auth-link" onClick={() => setMode('signup')}>Create an account</button>
              </div>
            </>
          )}

          {mode === 'otp' && (
            <>
              <h3 className="auth-otp-title">Enter OTP</h3>
              <p className="auth-otp-subtitle">Sent to +91 {phone}</p>
              <form onSubmit={handleOtpVerify} className="auth-form">
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                />
                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" className="auth-btn-secondary" onClick={() => setMode('login')}>
                  Change Number
                </button>
              </form>
            </>
          )}

          {mode === 'email-login' && (
            <>
              <div className="auth-tabs">
                <button className="auth-tab" onClick={() => setMode('login')}>Mobile</button>
                <button className="auth-tab active">Email</button>
              </div>
              <form onSubmit={handleEmailLogin} className="auth-form">
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  className="auth-input"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="auth-divider"><span>OR</span></div>

              <button className="auth-btn-google" onClick={handleGoogle} disabled={loading}>
                <img src="https://www.google.com/favicon.ico" alt="Google" width="18" />
                Continue with Google
              </button>

              <div className="auth-signup-link">
                New to Flipkart?{' '}
                <button className="auth-link" onClick={() => setMode('signup')}>Create an account</button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <>
              <h3 className="auth-otp-title">Create Account</h3>
              <form onSubmit={handleEmailSignup} className="auth-form">
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="auth-input"
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>

              <div className="auth-divider"><span>OR</span></div>

              <button className="auth-btn-google" onClick={handleGoogle} disabled={loading}>
                <img src="https://www.google.com/favicon.ico" alt="Google" width="18" />
                Sign up with Google
              </button>

              <div className="auth-signup-link">
                Already have an account?{' '}
                <button className="auth-link" onClick={() => setMode('login')}>Login</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
