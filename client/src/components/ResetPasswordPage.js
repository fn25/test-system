import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import '../styles/auth.css';

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Backend API call
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     token: token,
      //     password: data.password 
      //   })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              <Lock className="icon" />
            </div>
            <h2 className="auth-title">Invalid Reset Link</h2>
            <p className="auth-subtitle">
              This password reset link is invalid or has expired
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Please request a new password reset link.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/forgot-password" className="btn btn-primary btn-full">
              Request New Link
            </Link>
            <Link to="/login" className="btn btn-secondary btn-full">
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
            <Lock className="icon" />
          </div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">
            Create a strong new password for your account
          </p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock size={18} /> New Password
            </label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Create a strong password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <Lock size={18} /> Confirm New Password
            </label>
            <div className="password-field">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value =>
                    value === password || 'Passwords do not match'
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword.message}</p>
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
                Resetting password...
              </div>
            ) : (
              <>
                <CheckCircle size={20} />
                Reset Password
              </>
            )}
          </button>

          <div className="form-footer">
            <Link to="/login" className="link-primary">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
