import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Monitor, Users, Copy, Check, ArrowLeft, Play, Pause, 
  RefreshCw, Eye, Clock 
} from 'lucide-react';
import { quizAPI } from '../services/api';
import { getApiUrl } from '../config/api.config';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const HostLivePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetchQuiz();
    // Poll for participants every 3 seconds when live
    const interval = setInterval(() => {
      if (isLive) {
        fetchParticipants();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, isLive]);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      const response = await quizAPI.getQuizById(id);
      setQuiz(response.data.data.quiz);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
      navigate('/admin/quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      // This endpoint will be created in backend
      const response = await fetch(
        `${getApiUrl()}/quiz/${id}/participants`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setParticipants(data.data.participants || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const handleCopyCode = () => {
    if (quiz?.quizCode) {
      navigator.clipboard.writeText(quiz.quizCode);
      setIsCopied(true);
      toast.success('Quiz code copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleToggleLive = () => {
    setIsLive(!isLive);
    toast.success(isLive ? 'Quiz stopped' : 'Quiz is now live!');
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading quiz..." />;
  }

  if (!quiz) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-semibold mb-2">Quiz not found</h2>
        <Link to="/admin/quizzes" className="btn btn-primary">
          Back to Quizzes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <Link 
            to="/admin/quizzes" 
            className="btn btn-outline flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>
          
          <button
            onClick={handleToggleLive}
            className={`btn ${isLive ? 'btn-danger' : 'btn-primary'} flex items-center gap-2`}
          >
            {isLive ? (
              <>
                <Pause className="w-5 h-5" />
                Stop Quiz
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Live
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <Monitor className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600">{quiz.description}</p>
            )}
          </div>
        </div>

        {isLive && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="font-medium text-sm">LIVE</span>
            </div>
            <span className="text-sm text-gray-600">
              Participants can join now
            </span>
          </div>
        )}
      </div>

      {/* Quiz Code Card */}
      <div className="card text-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Quiz Access Code
        </h2>
        
        <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
          <div className="text-5xl font-bold text-blue-600 tracking-wider mb-2 font-mono">
            {quiz.quizCode || 'N/A'}
          </div>
          <p className="text-sm text-gray-500">
            Share this code with participants
          </p>
        </div>

        <button
          onClick={handleCopyCode}
          className="btn btn-primary mx-auto flex items-center gap-2"
          disabled={!quiz.quizCode}
        >
          {isCopied ? (
            <>
              <Check className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy Code
            </>
          )}
        </button>

        <div className="mt-4 text-sm text-gray-600">
          Participants can enter this code at: <br />
          <code className="bg-white px-2 py-1 rounded text-blue-600 font-mono">
            {window.location.origin}/guest
          </code>
        </div>
      </div>

      {/* Quiz Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <Eye className="w-6 h-6 text-purple-600" />
          </div>
          <div className="stat-value">{quiz.questionCount || 0}</div>
          <div className="stat-label">Questions</div>
        </div>

        <div className="card text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <div className="stat-value">
            {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}
          </div>
          <div className="stat-label">Time Limit</div>
        </div>

        <div className="card text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div className="stat-value">{participants.length}</div>
          <div className="stat-label">Active Participants</div>
        </div>
      </div>

      {/* Participants List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Participants
          </h2>
          <button
            onClick={fetchParticipants}
            className="btn btn-sm btn-outline flex items-center gap-2"
            disabled={!isLive}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {participants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => (
                  <tr key={participant.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="font-semibold">
                        {participant.firstName} {participant.lastName}
                      </div>
                    </td>
                    <td>
                      <div className="text-gray-600">
                        @{participant.username}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${participant.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {participant.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        participant.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : participant.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {participant.status || 'Joined'}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">
                      {participant.joinedAt 
                        ? new Date(participant.joinedAt).toLocaleTimeString()
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {isLive ? 'Waiting for participants...' : 'No participants yet'}
            </h3>
            <p className="text-gray-500">
              {isLive 
                ? 'Participants will appear here when they join using the quiz code'
                : 'Start the quiz to allow participants to join'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostLivePage;
