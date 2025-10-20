import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, resultAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Clock, Send } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const QuizTaking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(new Date());

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (quiz?.timeLimit && timeLeft === null) {
      setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const fetchQuiz = async () => {
    try {
      console.log('🔄 Fetching quiz with ID:', id);
      const response = await quizAPI.getQuiz(id);
      console.log('✅ Quiz response:', response);
      
      if (response.data && response.data.data && response.data.data.quiz) {
        setQuiz(response.data.data.quiz);
        console.log('✅ Quiz loaded:', response.data.data.quiz.title);
      } else {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Invalid quiz data structure');
      }
    } catch (error) {
      console.error('❌ Error fetching quiz:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        toast.error('Quiz not found');
      } else if (error.response?.status === 403) {
        toast.error('You do not have access to this quiz');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load quiz');
      }
      
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const unansweredQuestions = quiz.questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0 && timeLeft > 0) {
      const confirm = window.confirm(
        `You have ${unansweredQuestions.length} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirm) return;
    }

    try {
      setSubmitting(true);
      const submissionData = {
        quizId: id,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer: String(answer)
        })),
        timeSpent: Math.floor((new Date() - startTime) / 1000),
        startedAt: startTime.toISOString()
      };

      const response = await resultAPI.submitQuiz(submissionData);
      toast.success('Quiz submitted successfully!');
      navigate(`/results?resultId=${response.data.data.result.id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = quiz ? ((currentQuestion + 1) / quiz.questions.length) * 100 : 0;

  if (loading) {
    return <LoadingSpinner message="Loading quiz..." />;
  }

  if (!quiz) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-semibold mb-2">Quiz not found</h2>
        <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist or is no longer available.</p>
        <button onClick={() => navigate('/quizzes')} className="btn btn-primary">
          Back to Quizzes
        </button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="quiz-container">
      {/* Timer */}
      {timeLeft !== null && (
        <div className="quiz-timer">
          <div className={`timer-display ${timeLeft < 300 ? 'timer-warning' : ''}`}>
            <Clock className="inline-block mr-1" size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="quiz-progress">
        <div 
          className="quiz-progress-bar" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="question-card">
        <div className="question-number">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </div>

        <h2 className="question-text">{currentQ.question}</h2>

        {/* Media */}
        {currentQ.imageUrl && (
          <div className="question-media">
            <img 
              src={currentQ.imageUrl} 
              alt="Question illustration" 
              className="question-image"
            />
          </div>
        )}

        {currentQ.videoUrl && (
          <div className="question-media">
            <video 
              src={currentQ.videoUrl} 
              controls 
              className="question-video"
            />
          </div>
        )}

        {/* Answer Options */}
        <div className="mt-6">
          {currentQ.type === 'multiple_choice' && (
            <ul className="options-list">
              {currentQ.options.map((option, index) => (
                <li key={index} className="option-item">
                  <label 
                    className={`option-label ${
                      answers[currentQ.id] === String(index) ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQ.id}`}
                      value={index}
                      checked={answers[currentQ.id] === String(index)}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                      className="option-radio"
                    />
                    <span className="option-text">{option}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {currentQ.type === 'true_false' && (
            <ul className="options-list">
              {['true', 'false'].map((option) => (
                <li key={option} className="option-item">
                  <label 
                    className={`option-label ${
                      answers[currentQ.id] === option ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQ.id}`}
                      value={option}
                      checked={answers[currentQ.id] === option}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                      className="option-radio"
                    />
                    <span className="option-text">
                      {option === 'true' ? 'True' : 'False'}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {currentQ.type === 'short_answer' && (
            <div className="form-group">
              <textarea
                placeholder="Enter your answer..."
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                className="form-control textarea"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="btn btn-secondary"
        >
          <ChevronLeft className="inline-block mr-1" size={16} />
          Previous
        </button>

        <div className="text-sm text-gray-600">
          {Object.keys(answers).length} of {quiz.questions.length} answered
        </div>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="btn btn-primary"
          >
            Next
            <ChevronRight className="inline-block ml-1" size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-success"
          >
            {submitting ? (
              <>
                <div className="spinner w-4 h-4 mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="inline-block mr-1" size={16} />
                Submit Quiz
              </>
            )}
          </button>
        )}
      </div>

      {/* Question Navigation */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-3">Question Navigation:</div>
        <div className="grid grid-cols-10 gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded text-sm font-medium ${
                index === currentQuestion
                  ? 'bg-blue-600 text-white'
                  : answers[quiz.questions[index].id]
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;