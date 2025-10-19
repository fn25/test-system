import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { Result, Quiz, Question, User, sequelize } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();


router.post('/submit', authenticateToken, [
  body('quizId')
    .isUUID()
    .withMessage('Invalid quiz ID'),
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers must be a non-empty array'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a non-negative integer'),
  body('startedAt')
    .optional()
    .isISO8601()
    .withMessage('Started at must be a valid date')
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

    const { quizId, answers, timeSpent, startedAt } = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: Question,
          as: 'questions',
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

    if (!quiz.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Quiz is not active'
      });
    }

    const canAccess = quiz.isPublic || quiz.createdBy === userId;
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this quiz'
      });
    }

    if (quiz.maxAttempts) {
      const previousAttempts = await Result.count({
        where: { userId, quizId }
      });

      if (previousAttempts >= quiz.maxAttempts) {
        return res.status(403).json({
          success: false,
          message: `Maximum attempts (${quiz.maxAttempts}) exceeded`
        });
      }
    }

    let correctAnswers = 0;
    let totalPoints = 0;
    let pointsEarned = 0;
    const processedAnswers = [];

    quiz.questions.forEach(question => {
  totalPoints += question.points;
      const userAnswer = answers.find(a => a.questionId === question.id);
      const isCorrect = userAnswer && 
        String(userAnswer.answer).toLowerCase().trim() === 
        String(question.correctAnswer).toLowerCase().trim();

      if (isCorrect) {
        correctAnswers++;
        pointsEarned += question.points;
      }

      processedAnswers.push({
        questionId: question.id,
        userAnswer: userAnswer ? userAnswer.answer : null,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: question.points,
        pointsEarned: isCorrect ? question.points : 0
      });
    });

    const score = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
    const isPassed = score >= (quiz.passingScore || 60);

    const attemptNumber = await Result.count({
      where: { userId, quizId }
    }) + 1;

    const result = await Result.create({
      userId,
      quizId,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      totalPoints,
      pointsEarned,
      timeSpent: timeSpent || null,
      answers: processedAnswers,
      isPassed,
      attemptNumber,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: new Date()
    });

    const resultWithData = await Result.findByPk(result.id, {
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'passingScore', 'showCorrectAnswers']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        result: resultWithData,
        showAnswers: quiz.showCorrectAnswers || req.user.role === 'admin'
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});


router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      quizId,
      passed
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };

    if (quizId) where.quizId = quizId;
    if (passed !== undefined) where.isPassed = passed === 'true';

    const { count, rows: results } = await Result.findAndCountAll({
      where,
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'category', 'difficulty', 'passingScore']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

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


router.get('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Invalid result ID')
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
    
    const result = await Result.findByPk(id, {
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'showCorrectAnswers', 'passingScore'],
          include: [
            {
              model: Question,
              as: 'questions',
              attributes: ['id', 'question', 'type', 'options', 'correctAnswer', 'explanation'],
              order: [['order', 'ASC']]
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    const canView = result.userId === req.user.id || req.user.role === 'admin';
    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this result'
      });
    }

    res.json({
      success: true,
      message: 'Result retrieved successfully',
      data: {
        result,
        showAnswers: result.quiz.showCorrectAnswers || req.user.role === 'admin'
      }
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


router.get('/quiz/:quizId', authenticateToken, requireAdmin, [
  param('quizId').isUUID().withMessage('Invalid quiz ID')
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

    const { quizId } = req.params;
    const {
      page = 1,
      limit = 10,
      passed,
      sortBy = 'score',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { quizId };

    if (passed !== undefined) where.isPassed = passed === 'true';

    const orderBy = [];
    if (sortBy === 'score') {
      orderBy.push(['score', sortOrder.toUpperCase()]);
    } else if (sortBy === 'date') {
      orderBy.push(['createdAt', sortOrder.toUpperCase()]);
    } else if (sortBy === 'time') {
      orderBy.push(['timeSpent', sortOrder.toUpperCase()]);
    }
  orderBy.push(['createdAt', 'DESC']);

    const { count, rows: results } = await Result.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'email']
        },
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'passingScore']
        }
      ],
      order: orderBy,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const stats = await Result.findOne({
      where: { quizId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalAttempts'],
        [sequelize.fn('AVG', sequelize.col('score')), 'averageScore'],
        [sequelize.fn('MAX', sequelize.col('score')), 'highestScore'],
        [sequelize.fn('MIN', sequelize.col('score')), 'lowestScore'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "isPassed" = true THEN 1 END')), 'passedCount']
      ],
      raw: true
    });

    res.json({
      success: true,
      message: 'Quiz results retrieved successfully',
      data: {
        results,
        statistics: {
          totalAttempts: parseInt(stats.totalAttempts) || 0,
          averageScore: parseFloat(stats.averageScore) || 0,
          highestScore: parseInt(stats.highestScore) || 0,
          lowestScore: parseInt(stats.lowestScore) || 0,
          passedCount: parseInt(stats.passedCount) || 0,
          passRate: stats.totalAttempts > 0 
            ? ((parseInt(stats.passedCount) || 0) / parseInt(stats.totalAttempts) * 100).toFixed(2)
            : 0
        },
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


router.get('/user/:userId', authenticateToken, requireAdmin, [
  param('userId').isUUID().withMessage('Invalid user ID')
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

    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: results } = await Result.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'category', 'difficulty', 'passingScore']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'User results retrieved successfully',
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
    console.error('Get user results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user results',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});


router.delete('/:id', authenticateToken, requireAdmin, [
  param('id').isUUID().withMessage('Invalid result ID')
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
    const result = await Result.findByPk(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    await result.destroy();

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