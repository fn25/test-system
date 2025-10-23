import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { Quiz, Question } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.user.role !== 'admin') {
      filter.$or = [{ isPublic: true }, { userId: req.user._id }];
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const count = await Quiz.countDocuments(filter);
    const quizzes = await Quiz.find(filter)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const quizzesWithCounts = await Promise.all(
      quizzes.map(async (quiz) => {
        const questionCount = await Question.countDocuments({ quizId: quiz._id });
        return {
          ...quiz.toObject(),
          questionCount
        };
      })
    );

    res.json({
      success: true,
      message: 'Quizzes retrieved successfully',
      data: {
        quizzes: quizzesWithCounts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.get('/my-quizzes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const skip = (page - 1) * limit;

    const count = await Quiz.countDocuments({ userId: req.user._id });
    const quizzes = await Quiz.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const quizzesWithCounts = await Promise.all(
      quizzes.map(async (quiz) => {
        const questionCount = await Question.countDocuments({ quizId: quiz._id });
        return {
          ...quiz.toObject(),
          questionCount
        };
      })
    );

    res.json({
      success: true,
      message: 'Your quizzes retrieved successfully',
      data: {
        quizzes: quizzesWithCounts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.get('/access-by-code/:code', [
  param('code').isLength({ min: 6, max: 6 }).withMessage('Quiz code must be 6 digits').isNumeric().withMessage('Quiz code must contain only numbers')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { code } = req.params;
    const quiz = await Quiz.findOne({ quizCode: code });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found or inactive' });
    }

    const questions = await Question.find({ quizId: quiz._id }).select('-correctAnswer');

    res.json({
      success: true,
      message: 'Quiz accessed successfully',
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          isLive: quiz.isLive,
          startTime: quiz.startTime,
          endTime: quiz.endTime
        },
        questions: questions.map(q => ({
          id: q._id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          points: q.points,
          timeLimit: q.timeLimit,
          imageUrl: q.imageUrl
        }))
      }
    });
  } catch (error) {
    console.error('Access quiz by code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to access quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id).populate('userId', 'username email');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (req.user.role !== 'admin' && quiz.userId.toString() !== req.user._id.toString() && !quiz.isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const questions = await Question.find({ quizId: id });

    res.json({
      success: true,
      message: 'Quiz retrieved successfully',
      data: {
        quiz: quiz.toObject(),
        questions
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post('/', authenticateToken, requireAdmin, [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.questionText').notEmpty().withMessage('Question text is required'),
  body('questions.*.correctAnswer').notEmpty().withMessage('Correct answer is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { title, description, questions } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      userId: req.user._id,
      isPublic: true
    });

    const createdQuestions = await Promise.all(
      questions.map(async (q) => {
        return await Question.create({
          quizId: quiz._id,
          questionText: q.questionText,
          questionType: q.questionType || 'multiple-choice',
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          points: q.points || 1,
          timeLimit: q.timeLimit || 30,
          imageUrl: q.imageUrl
        });
      })
    );

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: {
        quiz: quiz.toObject(),
        questions: createdQuestions
      }
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    await quiz.save();

    if (questions && Array.isArray(questions)) {
      await Question.deleteMany({ quizId: id });
      await Promise.all(
        questions.map(async (q) => {
          return await Question.create({
            quizId: id,
            questionText: q.questionText,
            questionType: q.questionType || 'multiple-choice',
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
            timeLimit: q.timeLimit || 30,
            imageUrl: q.imageUrl
          });
        })
      );
    }

    const updatedQuestions = await Question.find({ quizId: id });

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: {
        quiz: quiz.toObject(),
        questions: updatedQuestions
      }
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await Question.deleteMany({ quizId: id });
    await Quiz.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post('/:id/go-live', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const questionCount = await Question.countDocuments({ quizId: id });
    if (questionCount === 0) {
      return res.status(400).json({ success: false, message: 'Cannot go live: Quiz has no questions' });
    }

    if (!quiz.quizCode) {
      quiz.quizCode = Math.floor(100000 + Math.random() * 900000).toString();
    }
    quiz.isLive = true;
    quiz.startTime = new Date();
    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz is now live',
      data: {
        quiz: quiz.toObject(),
        questionCount
      }
    });
  } catch (error) {
    console.error('Go live error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make quiz live',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post('/:id/end-live', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    quiz.isLive = false;
    quiz.endTime = new Date();
    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz live session ended',
      data: { quiz: quiz.toObject() }
    });
  } catch (error) {
    console.error('End live error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end live session',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
