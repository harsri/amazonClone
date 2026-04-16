import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './Login.scss';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const resetFields = () => {
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setOtp('');
    setNewPassword('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      } else if (mode === 'register') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        await register(name, email, password);
        toast.success('Account created successfully!');
        navigate(from, { replace: true });
      } else if (mode === 'forgot') {
        await api.post('/auth/forgot-password', { email });
        toast.success('OTP sent to your email.');
        setMode('reset');
      } else if (mode === 'reset') {
        await api.post('/auth/reset-password', { email, otp, newPassword });
        toast.success('Password reset successful! Please sign in.');
        resetFields();
        setMode('login');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <Link to="/">
        <div className="login__logo">
          <span className="logo-text">amazon</span>
          <span className="logo-suffix">247</span>
        </div>
      </Link>

      <div className="login__container">
        <h1>
          {mode === 'login' && 'Sign in'}
          {mode === 'register' && 'Create account'}
          {mode === 'forgot' && 'Password assistance'}
          {mode === 'reset' && 'Reset your password'}
        </h1>

        {error && (
          <div className="login__error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleAuth}>
          {mode === 'register' && (
            <div className="login__field">
              <label>Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="First and last name"
                autoComplete="name"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'forgot' || mode === 'reset') && (
            <div className="login__field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={mode === 'reset'}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div className="login__field">
              <div className="login__labelRow">
                <label>Password</label>
                {mode === 'login' && (
                  <span className="login__forgotLink" onClick={() => { resetFields(); setMode('forgot'); }}>
                    Forgot Password?
                  </span>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder={mode === 'login' ? 'Enter your password' : 'At least 6 characters'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
          )}

          {mode === 'reset' && (
            <>
              <div className="login__field">
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  placeholder="6-digit code from your email"
                />
              </div>
              <div className="login__field">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="login__signInButton"
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              mode === 'login' ? 'Sign In' : 
              mode === 'register' ? 'Create your Amazon account' :
              mode === 'forgot' ? 'Continue' : 'Set new password'
            )}
          </button>
        </form>

        {mode === 'forgot' && (
          <p className="login__helpText">
            Enter the email address associated with your Amazon 247 account and we'll send you an OTP to reset your password.
          </p>
        )}

        <p className="login__terms">
          By continuing, you agree to Amazon 247's Conditions of Use and Privacy Notice.
        </p>

        {mode === 'login' && (
          <>
            <div className="login__divider"><span>New to Amazon 247?</span></div>
            <button className="login__registerButton" onClick={() => { resetFields(); setMode('register'); }} type="button">
              Create your Amazon account
            </button>
          </>
        )}

        {(mode === 'register' || mode === 'forgot' || mode === 'reset') && (
          <button className="login__registerButton secondary" onClick={() => { resetFields(); setMode('login'); }} type="button">
            ← Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;
