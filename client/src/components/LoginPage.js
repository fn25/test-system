import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, LogIn, Mail, Lock, Play } from 'lucide-react';
import '../styles/auth.css';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const redirectPath = searchParams.get('redirect');
  const quizCode = searchParams.get('code');

  useEffect(() => {
    if (quizCode) {
      toast.success(`Quiz code: ${quizCode}. Please login to continue.`);
    }
  }, [quizCode]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);
    
    if (result.success) {
      toast.success('Login successful!');
      
      // If there's a redirect path and quiz code, redirect to play page with code
      if (redirectPath && quizCode) {
        navigate(`${redirectPath}?code=${quizCode}`);
      } else if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">
            <LogIn className="icon" />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue your learning journey</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="login" className="form-label">
              <Mail size={18} /> Username or Email
            </label>
            <input
              id="login"
              type="text"
              autoComplete="username"
              className={`form-control ${errors.login ? 'error' : ''}`}
              placeholder="Enter your username or email"
              {...register('login', {
                required: 'Username or email is required'
              })}
            />
            {errors.login && (
              <p className="form-error">{errors.login.message}</p>
            )}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label htmlFor="password" className="form-label" style={{ marginBottom: 0 }}>
                <Lock size={18} /> Password
              </label>
              <Link to="/forgot-password" className="link-primary" style={{ fontSize: '0.875rem' }}>
                Forgot Password?
              </Link>
            </div>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required'
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

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-full"
          >
            {isLoading ? (
              <div className="btn-loading">
                <div className="spinner"></div>
                Signing in...
              </div>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>

          <div className="form-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="link-primary">
                Create one now
              </Link>
            </p>
          </div>

          <div className="guest-access">
            <p className="guest-access-title">Just want to take a quiz?</p>
            <Link to="/play" className="btn btn-secondary btn-full">
              <Play size={20} />
              Play as Guest
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;