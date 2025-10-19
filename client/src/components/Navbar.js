import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, BookOpen, BarChart3, Settings, Play } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Show simplified navbar for guest access page
  if (!isAuthenticated && location.pathname === '/play') {
    return (
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/play" className="navbar-brand">
            <BookOpen className="inline-block mr-2" size={24} />
            TestLash Tizmi
          </Link>
          
          <ul className="navbar-nav">
            <li>
              <Link to="/login" className="nav-link">
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/register" className="nav-link" style={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                fontWeight: 'bold'
              }}>
                Create Account
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <BookOpen className="inline-block mr-2" size={24} />
          TestLash Tizmi
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/quizzes" 
              className={`nav-link ${isActive('/quizzes') ? 'active' : ''}`}
            >
              Quizzes
            </Link>
          </li>
          <li>
            <Link 
              to="/results" 
              className={`nav-link ${isActive('/results') ? 'active' : ''}`}
            >
              <BarChart3 className="inline-block mr-1" size={16} />
              Results
            </Link>
          </li>
          <li>
            <Link 
              to="/play" 
              className={`nav-link ${isActive('/play') ? 'active' : ''}`}
              style={{ 
                background: 'rgba(255, 255, 255, 0.15)',
                fontWeight: '600'
              }}
            >
              <Play className="inline-block mr-1" size={16} />
              Play Quiz
            </Link>
          </li>
          
          {isAdmin() && (
            <li>
              <Link 
                to="/admin" 
                className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              >
                <Settings className="inline-block mr-1" size={16} />
                Admin
              </Link>
            </li>
          )}
          
          <li>
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              <User className="inline-block mr-1" size={16} />
              {user?.username || 'Profile'}
            </Link>
          </li>
          
          <li>
            <button 
              onClick={handleLogout}
              className="nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <LogOut className="inline-block mr-1" size={16} />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;