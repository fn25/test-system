import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Plus, Trash2, Save, X, Copy, Check,
  AlertCircle, BookOpen, Clock, Award, PlusCircle, MinusCircle
} from 'lucide-react';
import { getApiUrl } from '../config/api.config';
import ImageUpload from './ImageUpload';

const CreateQuizPage = () => {
  const [quizCode, setQuizCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      timeLimit: '',
      passingScore: 70,
      startMode: 'auto',
      questions: [
        {
          text: '',
          type: 'multiple-choice',
          options: ['', ''], // Start with 2 options
          correctAnswer: 0,
          imageUrl: '',
          videoUrl: ''
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
  });

  // Add option to a question
  const addOption = (questionIndex) => {
    const currentOptions = watch(`questions.${questionIndex}.options`) || [];
    if (currentOptions.length >= 6) {
      toast.error('Maximum 6 options allowed');
      return;
    }
    setValue(`questions.${questionIndex}.options`, [...currentOptions, '']);
    toast.success('Option added');
  };

  // Remove option from a question
  const removeOption = (questionIndex, optionIndex) => {
    const currentOptions = watch(`questions.${questionIndex}.options`) || [];
    if (currentOptions.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    
    const correctAnswer = watch(`questions.${questionIndex}.correctAnswer`);
    const newOptions = currentOptions.filter((_, idx) => idx !== optionIndex);
    
    setValue(`questions.${questionIndex}.options`, newOptions);
    
    // Adjust correct answer if needed
    if (correctAnswer === optionIndex) {
      setValue(`questions.${questionIndex}.correctAnswer`, 0);
      toast.info('Correct answer reset to first option');
    } else if (correctAnswer > optionIndex) {
      setValue(`questions.${questionIndex}.correctAnswer`, correctAnswer - 1);
    }
    
    toast.success('Option removed');
  };

  // Generate random quiz code
  const generateQuizCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setQuizCode(code);
    toast.success('Quiz code generated!');
  };

  // Copy quiz code to clipboard
  const copyQuizCode = () => {
    navigator.clipboard.writeText(quizCode);
    setCopied(true);
    toast.success('Quiz code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (data) => {
    if (!quizCode) {
      toast.error('Please generate a quiz code first');
      return;
    }

    setIsLoading(true);
    
    try {
      // Backend API call
      const response = await fetch(`${getApiUrl()}/quiz`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...data, quizCode })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create quiz');
      }
      
      toast.success('Quiz created successfully!');
      navigate('/admin/quizzes');
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error(error.message || 'Failed to create quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="text-3xl font-bold" style={{ marginBottom: '0.5rem' }}>
              <BookOpen className="inline-block mr-2" size={32} />
              Create New Quiz
            </h1>
            <p style={{ color: '#6b7280' }}>
              Build an engaging quiz with questions, images, and videos
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {quizCode ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                color: 'white'
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '0.1em' }}>
                  {quizCode}
                </span>
                <button
                  type="button"
                  onClick={copyQuizCode}
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={generateQuizCode}
                className="btn btn-outline"
              >
                Generate Quiz Code
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Quiz Details */}
        <div className="card">
          <h2 className="card-title">Quiz Details</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                <BookOpen size={18} /> Quiz Title *
              </label>
              <input
                type="text"
                className={`form-control ${errors.title ? 'error' : ''}`}
                placeholder="Enter quiz title"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="form-error">{errors.title.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control textarea"
                placeholder="Describe what this quiz is about..."
                rows="3"
                {...register('description')}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Mathematics, Science"
                  {...register('category')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={18} /> Time Limit (minutes)
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0 = No limit"
                  {...register('timeLimit', { min: 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Award size={18} /> Passing Score (%)
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="70"
                  {...register('passingScore', { min: 0, max: 100 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Start Mode
                </label>
                <select
                  className="form-control"
                  {...register('startMode')}
                >
                  <option value="auto">Auto - Start immediately when participant joins</option>
                  <option value="manual">Manual - Admin starts the quiz</option>
                </select>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Choose how participants can start taking the quiz
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>
              Questions ({fields.length})
            </h2>
          </div>

          {fields.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <p>No questions yet. Click "Add Question" to get started.</p>
            </div>
          )}

          {fields.map((field, questionIndex) => (
            <div 
              key={field.id} 
              style={{ 
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                background: '#f9fafb'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                  Question {questionIndex + 1}
                </h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(questionIndex)}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Question Text *</label>
                  <textarea
                    className={`form-control ${errors.questions?.[questionIndex]?.text ? 'error' : ''}`}
                    placeholder="Enter your question..."
                    rows="2"
                    {...register(`questions.${questionIndex}.text`, { 
                      required: 'Question text is required' 
                    })}
                  />
                  {errors.questions?.[questionIndex]?.text && (
                    <p className="form-error">{errors.questions[questionIndex].text.message}</p>
                  )}
                </div>

                {/* Media Upload/URL */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <ImageUpload
                    label="Question Image"
                    type="image"
                    value={watch(`questions.${questionIndex}.imageUrl`) || ''}
                    onChange={(url) => setValue(`questions.${questionIndex}.imageUrl`, url)}
                  />

                  <ImageUpload
                    label="Question Video"
                    type="video"
                    value={watch(`questions.${questionIndex}.videoUrl`) || ''}
                    onChange={(url) => setValue(`questions.${questionIndex}.videoUrl`, url)}
                  />
                </div>

                {/* Answer Options */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Answer Options * ({watch(`questions.${questionIndex}.options`)?.length || 0}/6)
                    </label>
                    <button
                      type="button"
                      onClick={() => addOption(questionIndex)}
                      disabled={watch(`questions.${questionIndex}.options`)?.length >= 6}
                      className="btn btn-sm"
                      style={{
                        padding: '0.5rem 1rem',
                        background: watch(`questions.${questionIndex}.options`)?.length >= 6 ? '#e5e7eb' : '#10b981',
                        color: watch(`questions.${questionIndex}.options`)?.length >= 6 ? '#9ca3af' : 'white',
                        border: 'none',
                        cursor: watch(`questions.${questionIndex}.options`)?.length >= 6 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <PlusCircle size={16} />
                      Add Option
                    </button>
                  </div>
                  {watch(`questions.${questionIndex}.options`)?.map((_, optionIndex) => (
                    <div 
                      key={optionIndex}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        marginBottom: '0.75rem'
                      }}
                    >
                      <input
                        type="radio"
                        value={optionIndex}
                        {...register(`questions.${questionIndex}.correctAnswer`, {
                          required: true,
                          valueAsNumber: true
                        })}
                        style={{ width: '20px', height: '20px', flexShrink: 0 }}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Option ${optionIndex + 1}`}
                        {...register(`questions.${questionIndex}.options.${optionIndex}`, {
                          required: 'Option is required'
                        })}
                        style={{ flex: 1 }}
                      />
                      {watch(`questions.${questionIndex}.options`)?.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(questionIndex, optionIndex)}
                          className="btn btn-sm"
                          style={{
                            padding: '0.5rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                          title="Remove option"
                        >
                          <MinusCircle size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    ✓ Select the radio button next to the correct answer<br/>
                    ✓ Add 2-6 options using the "Add Option" button<br/>
                    ✓ Remove any option (except when only 2 remain)
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Add Question Button - At the bottom */}
          <button
            type="button"
            onClick={() => {
              append({
                text: '',
                type: 'multiple-choice',
                options: ['', ''], // Start with 2 options
                correctAnswer: 0,
                imageUrl: '',
                videoUrl: ''
              });
              // Scroll to bottom after adding
              setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }, 100);
            }}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: fields.length > 0 ? '1rem' : '0' }}
          >
            <Plus size={20} />
            Add Question
          </button>
        </div>

        {/* Submit Buttons */}
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/quizzes')}
              className="btn btn-secondary"
            >
              <X size={20} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !quizCode}
              className="btn btn-primary"
            >
              {isLoading ? (
                <div className="btn-loading">
                  <div className="spinner"></div>
                  Creating quiz...
                </div>
              ) : (
                <>
                  <Save size={20} />
                  Create Quiz
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateQuizPage;
