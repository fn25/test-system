import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Search, Filter, BookOpen, Clock, Star, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    fetchQuizzes();
  }, [searchTerm, selectedCategory, selectedDifficulty, pagination.currentPage]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 12,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined
      };

      const response = await quizAPI.getQuizzes(params);
      setQuizzes(response.data.data.quizzes);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'category') {
      setSelectedCategory(value);
    } else if (filterType === 'difficulty') {
      setSelectedDifficulty(value);
    }
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && pagination.currentPage === 1) {
    return <LoadingSpinner message="Loading quizzes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Quizzes</h1>
        <p className="text-gray-600">
          Test your knowledge with our collection of quizzes across various topics.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-control pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="form-control w-auto"
            >
              <option value="">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Math">Math</option>
              <option value="Language">Language</option>
              <option value="General Knowledge">General Knowledge</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="form-control w-auto"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {(searchTerm || selectedCategory || selectedDifficulty) && (
              <button
                onClick={clearFilters}
                className="btn btn-outline btn-sm"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {quizzes.length} of {pagination.totalItems} quizzes
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="space-y-3">
              {/* Quiz Header */}
              <div className="flex justify-between items-start">
                <h3 className="card-title text-lg">{quiz.title}</h3>
                {quiz.difficulty && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                )}
              </div>

              {/* Description */}
              {quiz.description && (
                <p className="text-gray-600 text-sm line-clamp-3">
                  {quiz.description}
                </p>
              )}

              {/* Quiz Stats */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {quiz.questionCount} questions
                </div>
                {quiz.timeLimit && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {quiz.timeLimit} min
                  </div>
                )}
                {quiz.category && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    {quiz.category}
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="space-y-2 text-xs text-gray-500">
                {quiz.passingScore && (
                  <div>Passing score: {quiz.passingScore}%</div>
                )}
                {quiz.maxAttempts && (
                  <div>Max attempts: {quiz.maxAttempts}</div>
                )}
                <div>Created by: {quiz.creator?.username || 'Admin'}</div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-gray-200">
                <Link
                  to={`/quiz/${quiz.id}`}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  Start Quiz
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && quizzes.length === 0 && (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory || selectedDifficulty
              ? 'Try adjusting your search or filters to find quizzes.'
              : 'No quizzes are available at the moment.'}
          </p>
          {(searchTerm || selectedCategory || selectedDifficulty) && (
            <button onClick={clearFilters} className="btn btn-primary">
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="pagination">
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={pagination.currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            {[...Array(pagination.totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === pagination.currentPage;
              const shouldShow = page === 1 || 
                               page === pagination.totalPages || 
                               (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1);
              
              if (!shouldShow) {
                if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                  return <span key={page} className="pagination-btn disabled">...</span>;
                }
                return null;
              }
              
              return (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                  className={`pagination-btn ${isCurrentPage ? 'active' : ''}`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {loading && pagination.currentPage > 1 && (
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default QuizList;