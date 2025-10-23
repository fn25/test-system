import express from 'express';
import { body, validationResult } from 'express-validator';
import { Result, Quiz, Question } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', [
  body('quizId').notEmpty().withMessage('Quiz ID is required'),
  body('answers').isArray({ min: 1 }).withMessage('Answers must be a non-empty array'),
  body('guestName').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { quizId, answers, guestName } = req.body;
    const userId = req.user ? req.user._id : null;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const questions = await Question.find({ quizId });
    if (questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Quiz has no questions' });
    }

    let correctAnswers = 0;
    let totalPoints = 0;
    const processedAnswers = [];

    questions.forEach(question => {
      totalPoints += question.points || 1;
      const userAnswer = answers.find(a => a.questionId === question._id.toString());
      const isCorrect = userAnswer && 
        String(userAnswer.answer).toLowerCase().trim() === 
        String(question.correctAnswer).toLowerCase().trim();

      if (isCorrect) {
        correctAnswers++;
      }

      processedAnswers.push({
        questionId: question._id,
        userAnswer: userAnswer ? userAnswer.answer : null,
        isCorrect
      });
    });

    const score = totalPoints > 0 ? (correctAnswers / questions.length) * 100 : 0;

    const result = await Result.create({
      quizId,
      userId,
      guestName,
      score,
      totalQuestions: questions.length,
      correctAnswers,
      answers: processedAnswers
    });

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        result: result.toObject(),
        score,
        correctAnswers,
        totalQuestions: questions.length
      }
    });
  } catch (error) {
    console.error('Submit result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit result',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, quizId } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }
    if (quizId) {
      filter.quizId = quizId;
    }

    const count = await Result.countDocuments(filter);
    const results = await Result.find(filter)
      .populate('quizId', 'title description')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.json({
      success: true,
      message: 'Results retrieved successfully',
      data: {
        results,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve results',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Result.findById(id)
      .populate('quizId', 'title description')
      .populate('userId', 'username email');

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    if (req.user.role !== 'admin' && result.userId && result.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      message: 'Result retrieved successfully',
      data: { result }
    });
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve result',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.get('/quiz/:quizId', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (req.user.role !== 'admin' && quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const count = await Result.countDocuments({ quizId });
    const results = await Result.find({ quizId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.json({
      success: true,
      message: 'Quiz results retrieved successfully',
      data: {
        results,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz results',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Result.findById(id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    await Result.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Result deleted successfully'
    });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete result',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
