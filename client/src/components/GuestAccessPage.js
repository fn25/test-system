import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Play, Hash, ArrowRight } from 'lucide-react';
import { getApiUrl } from '../config/api.config';
import '../styles/auth.css';

const GuestAccessPage = () => {
  const [quizCode, setQuizCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setQuizCode(codeFromUrl);
      toast.success('Quiz code loaded. Click "Start Quiz" to begin.');
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
      const response = await fetch(`${getApiUrl()}/quiz/access-by-code/${quizCode}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Invalid quiz code');
      }
      
      const quiz = result.data.quiz;
      toast.success(`Quiz found: ${quiz.title}`);
      navigate(`/quiz/${quiz.id}`);
    } catch (error) {
      console.error('Error accessing quiz:', error);
      toast.error(error.message || 'Invalid quiz code. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
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
              placeholder="Enter quiz code (e.g., 123456)"
              value={quizCode}
              onChange={handleCodeChange}
              style={{ 
                textAlign: 'center', 
                fontSize: '2rem', 
                fontWeight: 'bold',
                letterSpacing: '0.3em'
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
