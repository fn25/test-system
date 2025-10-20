import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { getApiUrl } from '../config/api.config';
import '../styles/auth.css';

const ForgotPasswordPage = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const email = watch('email');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Backend API call
      const response = await fetch(`${getApiUrl()}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send reset link');
      }
      
      setEmailSent(true);
      toast.success('Password reset link sent to your email!');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <CheckCircle className="icon" />
            </div>
            <h2 className="auth-title">Check Your Email</h2>
            <p className="auth-subtitle">
              We've sent a password reset link to
            </p>
            <p style={{ color: '#667eea', fontWeight: 600, marginTop: '0.5rem' }}>
              {email}
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Please check your email and click the reset link to create a new password.
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => setEmailSent(false)}
              className="btn btn-primary btn-full"
            >
              Resend Email
            </button>
            <Link to="/login" className="btn btn-secondary btn-full">
              <ArrowLeft size={20} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">
            <Mail className="icon" />
          </div>
          <h2 className="auth-title">Forgot Password?</h2>
          <p className="auth-subtitle">
            No worries! Enter your email and we'll send you reset instructions
          </p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={18} /> Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="your.email@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-full"
          >
            {isLoading ? (
              <div className="btn-loading">
                <div className="spinner"></div>
                Sending reset link...
              </div>
            ) : (
              <>
                <Mail size={20} />
                Send Reset Link
              </>
            )}
          </button>

          <div className="form-footer">
            <Link to="/login" className="link-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
