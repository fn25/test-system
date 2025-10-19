import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Play, Hash, ArrowRight } from 'lucide-react';
import '../styles/auth.css';

const GuestAccessPage = () => {
  const [quizCode, setQuizCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a quiz code in URL params
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setQuizCode(codeFromUrl.toUpperCase());
      toast.info('Quiz code loaded. Click "Start Quiz" to begin.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quizCode.trim()) {
      toast.error('Please enter a quiz code');
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Not logged in - redirect to login with quiz code
        toast.info('Please login to continue');
        navigate(`/login?redirect=/play&code=${quizCode}`);
        return;
      }

      // Backend API call to validate quiz code
      const response = await fetch(`${process.env.REACT_APP_API_URL}/quiz/access-by-code/${quizCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired - redirect to login
          localStorage.removeItem('token');
          toast.info('Session expired. Please login again');
          navigate(`/login?redirect=/play&code=${quizCode}`);
          return;
        }
        throw new Error(result.message || 'Invalid quiz code');
      }
      
      const quiz = result.data.quiz;
      
      toast.success(`Quiz found: ${quiz.title}`);
      // Navigate to quiz
      navigate(`/quiz/${quiz.id}`);
    } catch (error) {
      console.error('Error accessing quiz:', error);
      toast.error(error.message || 'Invalid quiz code. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    // Auto-uppercase and limit length
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 10) {
      setQuizCode(value);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">
            <Play className="icon" />
          </div>
          <h2 className="auth-title">Play Quiz</h2>
          <p className="auth-subtitle">
            Enter the quiz code to start playing instantly
          </p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quizCode" className="form-label">
              <Hash size={18} /> Quiz Code
            </label>
            <input
              id="quizCode"
              type="text"
              className="form-control"
              placeholder="Enter quiz code (e.g., QUIZ123)"
              value={quizCode}
              onChange={handleCodeChange}
              style={{ 
                textAlign: 'center', 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}
              autoFocus
            />
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
              Ask your teacher for the quiz code
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !quizCode.trim()}
            className="btn btn-primary btn-full"
          >
            {isLoading ? (
              <div className="btn-loading">
                <div className="spinner"></div>
                Checking code...
              </div>
            ) : (
              <>
                <ArrowRight size={20} />
                Start Quiz
              </>
            )}
          </button>

          <div className="guest-access">
            <p className="guest-access-title">Want to track your progress?</p>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Create a free account to save your quiz results and track your performance
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1 }}>
                Create Account
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ flex: 1 }}>
                Sign In
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuestAccessPage;
