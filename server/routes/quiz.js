import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { Op } from 'sequelize';
import { Quiz, Question, User } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      isPublic,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';
    if (req.user.role !== 'admin') {
      where.isActive = true;
      where[Op.or] = [
        { isPublic: true },
        { createdBy: req.user.id }
      ];
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: quizzes } = await Quiz.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Question,
          as: 'questions',
          attributes: ['id'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const quizzesWithCounts = quizzes.map(quiz => {
      const quizData = quiz.toJSON();
      quizData.questionCount = quiz.questions.length;
      delete quizData.questions;
      return quizData;
    });

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

// @route   GET /api/quiz/my-quizzes
// @desc    Get quizzes created by current user (admin)
// @access  Private (Admin only)
router.get('/my-quizzes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { createdBy: req.user.id };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: quizzes } = await Quiz.findAndCountAll({
      where,
      include: [
        {
          model: Question,
          as: 'questions',
          attributes: ['id'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const quizzesWithCounts = quizzes.map(quiz => {
      const quizData = quiz.toJSON();
      quizData.questionCount = quiz.questions.length;
      delete quizData.questions;
      return quizData;
    });

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

// @route   GET /api/quiz/access-by-code/:code
// @desc    Access quiz by code (for guest users)
// @access  Public
router.get('/access-by-code/:code', [
  param('code')
    .isLength({ min: 6, max: 10 })
    .withMessage('Quiz code must be between 6 and 10 characters')
    .isAlphanumeric()
    .withMessage('Quiz code must be alphanumeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { code } = req.params;
    
    const quiz = await Quiz.findOne({
      where: { 
        quizCode: code.toUpperCase(),
        isActive: true
      },
      include: [
        {
          model: Question,
          as: 'questions',
          attributes: { exclude: ['correctAnswer', 'explanation'] }
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found with this code'
      });
    }

    res.json({
      success: true,
      message: 'Quiz found',
      data: { quiz }
    });
  } catch (error) {
    console.error('Access by code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to access quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});


router.get('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Invalid quiz ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { includeAnswers = false } = req.query;

    const quiz = await Quiz.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Question,
          as: 'questions',
          attributes: includeAnswers === 'true' || req.user.role === 'admin' 
            ? undefined 
            : { exclude: ['correctAnswer', 'explanation'] },
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

  const canView = quiz.isPublic || 
           quiz.createdBy === req.user.id || 
           req.user.role === 'admin';

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this quiz'
      });
    }

    res.json({
      success: true,
      message: 'Quiz retrieved successfully',
      data: { quiz }
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
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('timeLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Time limit must be a positive integer'),
  body('passingScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),
  body('maxAttempts')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attempts must be a positive integer'),
  body('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category must be less than 100 characters'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const quizData = {
      ...req.body,
      createdBy: req.user.id
    };

    const quiz = await Quiz.create(quizData);

    const createdQuiz = await Quiz.findByPk(quiz.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz: createdQuiz }
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


router.put('/:id', authenticateToken, requireAdmin, [
  param('id').isUUID().withMessage('Invalid quiz ID'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('timeLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Time limit must be a positive integer'),
  body('passingScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),
  body('maxAttempts')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attempts must be a positive integer'),
  body('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category must be less than 100 characters'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { questions, ...quizData } = req.body;
    
    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Update quiz basic info
    await quiz.update(quizData);

    // Update questions if provided
    if (questions && Array.isArray(questions)) {
      // Get existing questions
      const existingQuestions = await Question.findAll({
        where: { quizId: id }
      });

      const existingQuestionIds = existingQuestions.map(q => q.id);
      const updatedQuestionIds = questions.filter(q => q.id).map(q => q.id);

      // Delete questions that are no longer in the list
      const questionsToDelete = existingQuestionIds.filter(
        qId => !updatedQuestionIds.includes(qId)
      );
      
      if (questionsToDelete.length > 0) {
        await Question.destroy({
          where: { id: questionsToDelete }
        });
      }

      // Update or create questions
      for (const questionData of questions) {
        if (questionData.id) {
          // Update existing question
          await Question.update(questionData, {
            where: { id: questionData.id, quizId: id }
          });
        } else {
          // Create new question
          await Question.create({
            ...questionData,
            quizId: id
          });
        }
      }
    }

    const updatedQuiz = await Quiz.findByPk(quiz.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Question,
          as: 'questions'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: { quiz: updatedQuiz }
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


router.delete('/:id', authenticateToken, requireAdmin, [
  param('id').isUUID().withMessage('Invalid quiz ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    await quiz.destroy();

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


router.post('/:id/questions', authenticateToken, requireAdmin, [
  param('id').isUUID().withMessage('Invalid quiz ID'),
  body('question')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Question must be between 1 and 2000 characters'),
  body('type')
    .isIn(['multiple_choice', 'true_false', 'short_answer'])
    .withMessage('Type must be multiple_choice, true_false, or short_answer'),
  body('options')
    .optional()
    .isArray({ min: 2 })
    .withMessage('Options must be an array with at least 2 items'),
  body('correctAnswer')
    .notEmpty()
    .withMessage('Correct answer is required'),
  body('points')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points must be a positive integer'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (!req.body.order) {
      const maxOrder = await Question.max('order', { where: { quizId: id } });
      req.body.order = (maxOrder || 0) + 1;
    }

    const questionData = {
      ...req.body,
      quizId: id
    };

    const question = await Question.create(questionData);

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: { question }
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add question',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});


router.put('/:quizId/questions/:questionId', authenticateToken, requireAdmin, [
  param('quizId').isUUID().withMessage('Invalid quiz ID'),
  param('questionId').isUUID().withMessage('Invalid question ID'),
  body('question')
    .optional()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Question must be between 1 and 2000 characters'),
  body('type')
    .optional()
    .isIn(['multiple_choice', 'true_false', 'short_answer'])
    .withMessage('Type must be multiple_choice, true_false, or short_answer'),
  body('options')
    .optional()
    .isArray({ min: 2 })
    .withMessage('Options must be an array with at least 2 items'),
  body('correctAnswer')
    .optional()
    .notEmpty()
    .withMessage('Correct answer cannot be empty'),
  body('points')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points must be a positive integer'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { quizId, questionId } = req.params;
    
    const question = await Question.findOne({
      where: { id: questionId, quizId }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await question.update(req.body);

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: { question }
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update question',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});


router.delete('/:quizId/questions/:questionId', authenticateToken, requireAdmin, [
  param('quizId').isUUID().withMessage('Invalid quiz ID'),
  param('questionId').isUUID().withMessage('Invalid question ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { quizId, questionId } = req.params;
    
    const question = await Question.findOne({
      where: { id: questionId, quizId }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await question.destroy();

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PATCH /api/quiz/:id/privacy
// @desc    Toggle quiz privacy (public/private)
// @access  Private (Admin/Creator only)
router.patch('/:id/privacy', authenticateToken, requireAdmin, [
  param('id').isUUID().withMessage('Invalid quiz ID'),
  body('isPublic').isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { isPublic } = req.body;

    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user is creator or admin
    if (quiz.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own quizzes.'
      });
    }

    await quiz.update({ isPublic });

    res.json({
      success: true,
      message: `Quiz is now ${isPublic ? 'public' : 'private'}`,
      data: { 
        quiz: {
          id: quiz.id,
          title: quiz.title,
          isPublic: quiz.isPublic
        }
      }
    });
  } catch (error) {
    console.error('Toggle privacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz privacy',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;