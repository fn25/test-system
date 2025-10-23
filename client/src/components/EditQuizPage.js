import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Plus, Trash2, Save, X, ArrowLeft,
  AlertCircle, BookOpen, Clock, Award, PlusCircle, MinusCircle
} from 'lucide-react';
import ImageUpload from './ImageUpload';
import LoadingSpinner from './LoadingSpinner';
import { quizAPI } from '../services/api';

const EditQuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [quiz, setQuiz] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      timeLimit: '',
      passingScore: 70,
      isPublic: true,
      startMode: 'auto',
      questions: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
  });

  // Fetch quiz data
  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      const response = await quizAPI.getQuizById(id);
      const quizData = response.data.data.quiz;
      setQuiz(quizData);

      // Populate form with quiz data
      reset({
        title: quizData.title || '',
        description: quizData.description || '',
        category: quizData.category || '',
        timeLimit: quizData.timeLimit || '',
        passingScore: quizData.passingScore || 70,
        isPublic: quizData.isPublic !== undefined ? quizData.isPublic : true,
        startMode: quizData.startMode || 'auto',
        questions: quizData.questions?.map(q => ({
          id: q.id,
          text: q.text || '',
          type: q.type || 'multiple-choice',
          options: q.options || ['', ''],
          correctAnswer: q.correctAnswer || 0,
          imageUrl: q.imageUrl || '',
          videoUrl: q.videoUrl || ''
        })) || []
      });
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
      navigate('/admin/quizzes');
    } finally {
      setIsLoading(false);
    }
  };

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
      toast.success('Correct answer reset to first option');
    } else if (correctAnswer > optionIndex) {
      setValue(`questions.${questionIndex}.correctAnswer`, correctAnswer - 1);
    }
    
    toast.success('Option removed');
  };

  // Add new question
  const addQuestion = () => {
    append({
      text: '',
      type: 'multiple-choice',
      options: ['', ''],
      correctAnswer: 0,
      imageUrl: '',
      videoUrl: ''
    });
    toast.success('Question added');
  };

  // Remove question
  const removeQuestion = (index) => {
    if (fields.length === 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    remove(index);
    toast.success('Question removed');
  };

  // Submit form - update quiz
  const onSubmit = async (data) => {
    if (data.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Validate questions
    for (let i = 0; i < data.questions.length; i++) {
      const question = data.questions[i];
      
      if (!question.text.trim()) {
        toast.error(`Question ${i + 1}: Please enter question text`);
        return;
      }

      if (question.options.some(opt => !opt.trim())) {
        toast.error(`Question ${i + 1}: All options must be filled`);
        return;
      }

      if (question.correctAnswer === undefined || question.correctAnswer === null) {
        toast.error(`Question ${i + 1}: Please select the correct answer`);
        return;
      }
    }

    try {
      setIsSaving(true);

      const quizData = {
        title: data.title,
        description: data.description,
        category: data.category,
        timeLimit: data.timeLimit ? parseInt(data.timeLimit) : null,
        passingScore: parseInt(data.passingScore),
        isPublic: data.isPublic,
        startMode: data.startMode || 'auto',
        questions: data.questions.map(q => ({
          id: q.id, // Include ID for updating existing questions
          text: q.text,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          imageUrl: q.imageUrl || null,
          videoUrl: q.videoUrl || null
        }))
      };

      await quizAPI.updateQuiz(id, quizData);
      
      toast.success('Quiz updated successfully!');
      navigate('/admin/quizzes');
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to update quiz');
    } finally {
      setIsSaving(false);
    }
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ✏️ Edit Quiz
            </h1>
            <p className="text-gray-600">
              Update quiz details and questions
            </p>
          </div>
          <Link to="/admin/quizzes" className="btn btn-outline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Quiz Details */}
        <div className="card">
          <h2 className="card-title mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Quiz Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="form-label required">Quiz Title</label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="form-control"
                placeholder="e.g., JavaScript Basics"
              />
              {errors.title && (
                <p className="form-error">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                {...register('description')}
                className="form-control"
                rows="3"
                placeholder="Brief description of the quiz..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Category</label>
                <input
                  {...register('category')}
                  type="text"
                  className="form-control"
                  placeholder="e.g., Programming"
                />
              </div>

              <div>
                <label className="form-label flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Time Limit (minutes)
                </label>
                <input
                  {...register('timeLimit', { 
                    min: { value: 1, message: 'Minimum 1 minute' } 
                  })}
                  type="number"
                  className="form-control"
                  placeholder="Optional"
                />
                {errors.timeLimit && (
                  <p className="form-error">{errors.timeLimit.message}</p>
                )}
              </div>

              <div>
                <label className="form-label flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Passing Score (%)
                </label>
                <input
                  {...register('passingScore', { 
                    required: 'Required',
                    min: { value: 0, message: 'Min 0%' },
                    max: { value: 100, message: 'Max 100%' }
                  })}
                  type="number"
                  className="form-control"
                  placeholder="70"
                />
                {errors.passingScore && (
                  <p className="form-error">{errors.passingScore.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                {...register('isPublic')}
                type="checkbox"
                id="isPublic"
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                Make this quiz public
              </label>
            </div>

            <div>
              <label className="form-label">Start Mode</label>
              <select
                {...register('startMode')}
                className="form-control"
              >
                <option value="auto">Auto - Start immediately when participant joins</option>
                <option value="manual">Manual - Admin starts the quiz</option>
              </select>
              <p className="text-sm text-gray-600 mt-1">
                Choose how participants can start taking the quiz
              </p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Questions ({fields.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {fields.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-4">No questions yet</p>
              <button
                type="button"
                onClick={addQuestion}
                className="btn btn-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Question
              </button>
            </div>
          )}

          <div className="space-y-6">
            {fields.map((field, qIndex) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700">
                    Question {qIndex + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Remove question"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="form-label required">Question Text</label>
                    <textarea
                      {...register(`questions.${qIndex}.text`, {
                        required: 'Question text is required'
                      })}
                      className="form-control"
                      rows="2"
                      placeholder="Enter your question..."
                    />
                    {errors.questions?.[qIndex]?.text && (
                      <p className="form-error">
                        {errors.questions[qIndex].text.message}
                      </p>
                    )}
                  </div>

                  {/* Image/Video Upload */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageUpload
                      label="Question Image (Optional)"
                      value={watch(`questions.${qIndex}.imageUrl`)}
                      onChange={(url) => setValue(`questions.${qIndex}.imageUrl`, url)}
                      accept="image/*"
                    />
                    <ImageUpload
                      label="Question Video (Optional)"
                      value={watch(`questions.${qIndex}.videoUrl`)}
                      onChange={(url) => setValue(`questions.${qIndex}.videoUrl`, url)}
                      accept="video/*"
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="form-label required">
                        Answer Options (2-6)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, watch(`questions.${qIndex}.options`).length - 1)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                          disabled={watch(`questions.${qIndex}.options`)?.length <= 2}
                        >
                          <MinusCircle className="w-4 h-4" />
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                          disabled={watch(`questions.${qIndex}.options`)?.length >= 6}
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {watch(`questions.${qIndex}.options`)?.map((_, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            {...register(`questions.${qIndex}.correctAnswer`, {
                              required: 'Please select correct answer'
                            })}
                            type="radio"
                            value={optIndex}
                            id={`q${qIndex}-opt${optIndex}`}
                            className="w-4 h-4 text-green-600"
                          />
                          <input
                            {...register(`questions.${qIndex}.options.${optIndex}`, {
                              required: 'Option text required'
                            })}
                            type="text"
                            className="form-control flex-1"
                            placeholder={`Option ${optIndex + 1}`}
                          />
                          {optIndex >= 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, optIndex)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Remove this option"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {errors.questions?.[qIndex]?.correctAnswer && (
                      <p className="form-error">
                        {errors.questions[qIndex].correctAnswer.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link
              to="/admin/quizzes"
              className="btn btn-outline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditQuizPage;
