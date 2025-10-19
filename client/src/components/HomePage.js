import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI, resultAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { BookOpen, TrendingUp, Clock, Trophy, Users, BarChart3 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const HomePage = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    recentResults: []
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch available quizzes
      const quizzesResponse = await quizAPI.getQuizzes({ limit: 5 });
      setRecentQuizzes(quizzesResponse.data.data.quizzes);

      // Fetch user results for statistics
      const resultsResponse = await resultAPI.getResults({ limit: 5 });
      const results = resultsResponse.data.data.results;
      
      // Calculate statistics
      const completedQuizzes = results.length;
      const averageScore = results.length > 0 
        ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
        : 0;

      setStats({
        totalQuizzes: quizzesResponse.data.data.pagination.totalItems,
        completedQuizzes,
        averageScore,
        recentResults: results
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || user?.username}! 👋
        </h1>
        <p className="text-gray-600">
          Ready to test your knowledge? Choose from available quizzes or check your progress.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div className="stat-value">{stats.totalQuizzes}</div>
          <div className="stat-label">Available Quizzes</div>
        </div>

        <div className="card text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6 text-green-600" />
          </div>
          <div className="stat-value">{stats.completedQuizzes}</div>
          <div className="stat-label">Completed Quizzes</div>
        </div>

        <div className="card text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div className="stat-value">{stats.averageScore}%</div>
          <div className="stat-label">Average Score</div>
        </div>

        <div className="card text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div className="stat-value">
            {stats.recentResults.filter(r => r.isPassed).length}
          </div>
          <div className="stat-label">Passed Quizzes</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quizzes */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Available Quizzes</h2>
            <p className="card-subtitle">Start a new quiz or continue learning</p>
          </div>
          
          <div className="space-y-3">
            {recentQuizzes.length > 0 ? (
              recentQuizzes.map(quiz => (
                <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {quiz.questionCount} questions
                    </span>
                  </div>
                  
                  {quiz.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {quiz.category && (
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {quiz.category}
                        </span>
                      )}
                      {quiz.timeLimit && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {quiz.timeLimit} min
                        </span>
                      )}
                    </div>
                    
                    <Link
                      to={`/quiz/${quiz.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Start Quiz
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No quizzes available yet.</p>
                {isAdmin() && (
                  <Link to="/admin" className="btn btn-primary mt-3">
                    Create a Quiz
                  </Link>
                )}
              </div>
            )}
          </div>
          
          {recentQuizzes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link to="/quizzes" className="btn btn-outline w-full">
                View All Quizzes
              </Link>
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Results</h2>
            <p className="card-subtitle">Your latest quiz performance</p>
          </div>
          
          <div className="space-y-3">
            {stats.recentResults.length > 0 ? (
              stats.recentResults.map(result => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {result.quiz.title}
                    </h3>
                    <span className={`text-lg font-bold ${
                      result.isPassed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.score}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      {result.correctAnswers}/{result.totalQuestions} correct
                    </span>
                    <span>
                      {new Date(result.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          result.isPassed ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No quiz results yet.</p>
                <p className="text-sm mt-1">Complete a quiz to see your results here.</p>
              </div>
            )}
          </div>
          
          {stats.recentResults.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link to="/results" className="btn btn-outline w-full">
                View All Results
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Admin Quick Actions */}
      {isAdmin() && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Admin Quick Actions</h2>
            <p className="card-subtitle">Manage your quiz platform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/quizzes" className="btn btn-outline">
              <BookOpen className="w-5 h-5 mr-2" />
              Manage Quizzes
            </Link>
            <Link to="/admin/results" className="btn btn-outline">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Results
            </Link>
            <Link to="/admin/users" className="btn btn-outline">
              <Users className="w-5 h-5 mr-2" />
              Manage Users
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;