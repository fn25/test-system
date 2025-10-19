import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  Settings, BookOpen, Users, BarChart3, Plus, Edit2, Trash2, 
  Search, Eye, CheckCircle, XCircle, Trophy, Calendar, Lock, Unlock, Monitor
} from 'lucide-react';
import { quizAPI, resultAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import CreateQuizPage from './CreateQuizPage';
import EditQuizPage from './EditQuizPage';
import HostLivePage from './HostLivePage';

const AdminDashboard = () => {
  const location = useLocation();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎓 Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage quizzes, users, and view analytics.</p>
      </div>

      {/* Admin Navigation */}
      <div className="admin-nav">
        <ul className="admin-nav-list">
          <li>
            <Link 
              to="/admin" 
              className={`admin-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              <Settings className="inline w-4 h-4 mr-1" />
              Overview
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/quizzes" 
              className={`admin-nav-link ${location.pathname.includes('/admin/quizzes') ? 'active' : ''}`}
            >
              <BookOpen className="inline w-4 h-4 mr-1" />
              Quizzes
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/results" 
              className={`admin-nav-link ${location.pathname.includes('/admin/results') ? 'active' : ''}`}
            >
              <BarChart3 className="inline w-4 h-4 mr-1" />
              Results
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/users" 
              className={`admin-nav-link ${location.pathname.includes('/admin/users') ? 'active' : ''}`}
            >
              <Users className="inline w-4 h-4 mr-1" />
              Users
            </Link>
          </li>
        </ul>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/quizzes" element={<QuizManagement />} />
        <Route path="/quizzes/create" element={<CreateQuizPage />} />
        <Route path="/quizzes/edit/:id" element={<EditQuizPage />} />
        <Route path="/quizzes/host/:id" element={<HostLivePage />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/results" element={<ResultsManagement />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
};

// Admin Overview Component
const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalUsers: 0,
    totalResults: 0,
    averageScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const [quizzesRes, resultsRes] = await Promise.all([
        quizAPI.getQuizzes({ limit: 1 }),
        resultAPI.getResults({ limit: 100 })
      ]);

      const results = resultsRes.data.data.results;
      const avgScore = results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : 0;

      setStats({
        totalQuizzes: quizzesRes.data.data.pagination.totalItems,
        totalResults: resultsRes.data.data.pagination.totalItems,
        totalUsers: new Set(results.map(r => r.userId)).size,
        averageScore: avgScore
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading statistics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div className="stat-value">{stats.totalQuizzes}</div>
          <div className="stat-label">Total Quizzes</div>
        </div>

        <div className="card text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Active Users</div>
        </div>

        <div className="card text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6 text-purple-600" />
          </div>
          <div className="stat-value">{stats.totalResults}</div>
          <div className="stat-label">Quiz Attempts</div>
        </div>

        <div className="card text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <BarChart3 className="w-6 h-6 text-orange-600" />
          </div>
          <div className="stat-value">{stats.averageScore}%</div>
          <div className="stat-label">Average Score</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="card-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/quizzes/create" className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Create New Quiz
          </Link>
          <Link to="/admin/results" className="btn btn-outline">
            <BarChart3 className="w-5 h-5 mr-2" />
            View All Results
          </Link>
          <Link to="/admin/users" className="btn btn-outline">
            <Users className="w-5 h-5 mr-2" />
            Manage Users
          </Link>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="card text-center">
        <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold mb-2">Admin Control Panel</h2>
        <p className="text-gray-600">Welcome to the admin dashboard.</p>
        <p className="text-sm text-gray-500 mt-2">
          Use the navigation above to manage quizzes, view results, and control user access.
        </p>
      </div>
    </div>
  );
};

// Quiz Management Component
const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      // Use getMyQuizzes to only show admin's own quizzes
      const response = await quizAPI.getMyQuizzes({ limit: 100 });
      setQuizzes(response.data.data.quizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      await quizAPI.deleteQuiz(id);
      toast.success('Quiz deleted successfully');
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const handleTogglePrivacy = async (quiz) => {
    try {
      await quizAPI.togglePrivacy(quiz.id, !quiz.isPublic);
      toast.success(`Quiz is now ${!quiz.isPublic ? 'public' : 'private'}`);
      fetchQuizzes();
    } catch (error) {
      console.error('Error toggling privacy:', error);
      toast.error('Failed to update quiz privacy');
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading quizzes..." />;
  }

  return (
    <div className="space-y-4">
      {/* Header with Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="card-title">Quiz Management</h2>
            <p className="card-subtitle">Create, edit, and manage your quizzes</p>
          </div>
          <Link to="/admin/quizzes/create" className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Create New Quiz
          </Link>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search quizzes..."
            className="form-control pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Quizzes List */}
      <div className="card">
        {filteredQuizzes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map(quiz => (
                  <tr key={quiz.id}>
                    <td>
                      <div className="font-semibold">{quiz.title}</div>
                      {quiz.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {quiz.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {quiz.category || 'General'}
                      </span>
                    </td>
                    <td>{quiz.questionCount || 0}</td>
                    <td>
                      <button
                        onClick={() => handleTogglePrivacy(quiz)}
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                          quiz.isPublic 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={`Click to make ${quiz.isPublic ? 'private' : 'public'}`}
                      >
                        {quiz.isPublic ? (
                          <>
                            <Unlock className="w-3 h-3" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            Private
                          </>
                        )}
                      </button>
                    </td>
                    <td>{quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}</td>
                    <td>{new Date(quiz.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link 
                          to={`/admin/quizzes/host/${quiz.id}`}
                          className="btn btn-sm btn-primary" 
                          title="Host Live"
                        >
                          <Monitor className="w-4 h-4" />
                        </Link>
                        <Link 
                          to={`/admin/quizzes/edit/${quiz.id}`}
                          className="btn btn-sm btn-outline" 
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(quiz.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No quizzes found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first quiz'}
            </p>
            {!searchTerm && (
              <Link to="/admin/quizzes/create" className="btn btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Create New Quiz
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = () => {
  return (
    <div className="card text-center">
      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h2 className="text-xl font-semibold mb-2">User Management</h2>
      <p className="text-gray-600 mb-4">Manage user accounts and permissions.</p>
      <p className="text-sm text-gray-500">
        User management features coming soon. You'll be able to view all users, 
        manage their roles, and control access permissions.
      </p>
    </div>
  );
};

// Results Management Component
const ResultsManagement = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const response = await resultAPI.getResults({ limit: 50 });
      setResults(response.data.data.results);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading results..." />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card">
        <h2 className="card-title">Quiz Results</h2>
        <p className="card-subtitle">View and analyze student quiz performance</p>
      </div>

      {/* Results List */}
      <div className="card">
        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Correct/Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => (
                  <tr key={result.id}>
                    <td>
                      <div className="font-semibold">
                        {result.user?.firstName} {result.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{result.user?.username}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">{result.quiz?.title}</div>
                    </td>
                    <td>
                      <span className={`text-lg font-bold ${
                        result.isPassed ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.score}%
                      </span>
                    </td>
                    <td>
                      {result.correctAnswers}/{result.totalQuestions}
                    </td>
                    <td>
                      {result.isPassed ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Passed
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="w-4 h-4 mr-1" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(result.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No results yet</h3>
            <p className="text-gray-500">
              Results will appear here once students complete quizzes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;