import express from 'express';import express from 'express';

import jwt from 'jsonwebtoken';import jwt from 'jsonwebtoken';

import crypto from 'crypto';import crypto from 'crypto';

import { body, validationResult } from 'express-validator';import { body, validationResult } from 'express-validator';

import { User } from '../models/index.js';import { User } from '../models/index.js';

import { authenticateToken } from '../middleware/auth.js';import { authenticateToken } from '../middleware/auth.js';

import { sendPasswordResetEmail } from '../services/emailService.js';import { sendPasswordResetEmail } from '../services/emailService.js';



const router = express.Router();const router = express.Router();



const generateToken = (userId) => {const generateToken = (userId) => {

  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });

};};



router.post('/register', [router.post('/register', [

  body('username').isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),  body('username')

  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),    .isLength({ min: 3, max: 30 })

  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),    .withMessage('Username must be between 3 and 30 characters')

  body('role').optional().isIn(['admin', 'user']).withMessage('Role must be either admin or user')    .matches(/^[a-zA-Z0-9_]+$/)

], async (req, res) => {    .withMessage('Username can only contain letters, numbers, and underscores'),

  try {  body('email')

    const errors = validationResult(req);    .isEmail()

    if (!errors.isEmpty()) {    .withMessage('Please provide a valid email')

      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });    .normalizeEmail(),

    }  body('password')

    .isLength({ min: 6 })

    const { username, email, password, role } = req.body;    .withMessage('Password must be at least 6 characters long'),

    const existingUser = await User.findOne({ email });  body('role')

    if (existingUser) {    .optional()

      return res.status(409).json({ success: false, message: 'User with this email already exists' });    .isIn(['admin', 'user'])

    }    .withMessage('Role must be either admin or user')

], async (req, res) => {

    const user = await User.create({ username, email, password, role: role || 'user' });  try {

    const token = generateToken(user._id);    const errors = validationResult(req);

    if (!errors.isEmpty()) {

    res.status(201).json({      return res.status(400).json({

      success: true,        success: false,

      message: 'User registered successfully',        message: 'Validation errors',

      data: { user: { id: user._id, username: user.username, email: user.email, role: user.role }, token }        errors: errors.array()

    });      });

  } catch (error) {    }

    console.error('Registration error:', error);

    res.status(500).json({ success: false, message: 'Registration failed', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });    const { username, email, password, role } = req.body;

  }

});    const existingUser = await User.findOne({ email });

    if (existingUser) {

router.post('/login', [      return res.status(409).json({

  body('login').notEmpty().withMessage('Username or email is required'),        success: false,

  body('password').notEmpty().withMessage('Password is required')        message: 'User with this email already exists'

], async (req, res) => {      });

  try {    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {    const user = await User.create({

      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });      username,

    }      email,

      password,

    const { login, password } = req.body;      role: role || 'user'

    const user = await User.findOne({ $or: [{ email: login }, { username: login }] });    });



    if (!user) {    const token = generateToken(user._id);

      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    }    res.status(201).json({

      success: true,

    const isPasswordValid = await user.comparePassword(password);      message: 'User registered successfully',

    if (!isPasswordValid) {      data: {

      return res.status(401).json({ success: false, message: 'Invalid credentials' });        user: {

    }          id: user._id,

          username: user.username,

    const token = generateToken(user._id);          email: user.email,

          role: user.role

    res.json({        },

      success: true,        token

      message: 'Login successful',      }

      data: { user: { id: user._id, username: user.username, email: user.email, role: user.role }, token }    });

    });  } catch (error) {

  } catch (error) {    console.error('Registration error:', error);

    console.error('Login error:', error);    res.status(500).json({

    res.status(500).json({ success: false, message: 'Login failed', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });      success: false,

  }      message: 'Registration failed',

});      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'

    });

router.get('/profile', authenticateToken, async (req, res) => {  }

  try {});

    res.json({

      success: true,router.post('/login', [

      message: 'Profile retrieved successfully',  body('login').notEmpty().withMessage('Username or email is required'),

      data: { user: { id: req.user._id, username: req.user.username, email: req.user.email, role: req.user.role } }  body('password').notEmpty().withMessage('Password is required')

    });], async (req, res) => {

  } catch (error) {  try {

    console.error('Profile error:', error);    const errors = validationResult(req);

    res.status(500).json({ success: false, message: 'Failed to retrieve profile', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });    if (!errors.isEmpty()) {

  }      return res.status(400).json({

});        success: false,

        message: 'Validation errors',

router.post('/verify-token', authenticateToken, (req, res) => {        errors: errors.array()

  res.json({      });

    success: true,    }

    message: 'Token is valid',

    data: { user: { id: req.user._id, username: req.user.username, email: req.user.email, role: req.user.role } }    const { login, password } = req.body;

  });

});    const user = await User.findOne({

      \$or: [{ email: login }, { username: login }]

router.post('/forgot-password', [    });

  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail()

], async (req, res) => {    if (!user) {

  try {      return res.status(401).json({

    const errors = validationResult(req);        success: false,

    if (!errors.isEmpty()) {        message: 'Invalid credentials'

      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });      });

    }    }



    const { email } = req.body;    const isPasswordValid = await user.comparePassword(password);

    const user = await User.findOne({ email });    if (!isPasswordValid) {

          return res.status(401).json({

    if (!user) {        success: false,

      return res.json({ success: true, message: 'If an account exists with that email, a password reset link has been sent' });        message: 'Invalid credentials'

    }      });

    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const resetTokenExpiry = new Date(Date.now() + 3600000);    const token = generateToken(user._id);



    user.resetPasswordToken = resetToken;    res.json({

    user.resetPasswordExpires = resetTokenExpiry;      success: true,

    await user.save();      message: 'Login successful',

      data: {

    try {        user: {

      await sendPasswordResetEmail(email, resetToken, user.username);          id: user._id,

      res.json({ success: true, message: 'If an account exists with that email, a password reset link has been sent' });          username: user.username,

    } catch (emailError) {          email: user.email,

      console.error('Email send failed:', emailError);          role: user.role

      user.resetPasswordToken = null;        },

      user.resetPasswordExpires = null;        token

      await user.save();      }

      res.status(500).json({ success: false, message: 'Failed to send password reset email. Please try again later.' });    });

    }  } catch (error) {

  } catch (error) {    console.error('Login error:', error);

    console.error('Forgot password error:', error);    res.status(500).json({

    res.status(500).json({ success: false, message: 'An error occurred. Please try again later.', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });      success: false,

  }      message: 'Login failed',

});      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'

    });

router.post('/reset-password', [  }

  body('token').notEmpty().withMessage('Reset token is required'),});

  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')

], async (req, res) => {router.get('/profile', authenticateToken, async (req, res) => {

  try {  try {

    const errors = validationResult(req);    res.json({

    if (!errors.isEmpty()) {      success: true,

      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });      message: 'Profile retrieved successfully',

    }      data: {

        user: {

    const { token, password } = req.body;          id: req.user._id,

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });          username: req.user.username,

          email: req.user.email,

    if (!user) {          role: req.user.role

      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });        }

    }      }

    });

    user.password = password;  } catch (error) {

    user.resetPasswordToken = null;    console.error('Profile error:', error);

    user.resetPasswordExpires = null;    res.status(500).json({

    await user.save();      success: false,

      message: 'Failed to retrieve profile',

    res.json({ success: true, message: 'Password has been reset successfully. You can now log in with your new password.' });      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'

  } catch (error) {    });

    console.error('Reset password error:', error);  }

    res.status(500).json({ success: false, message: 'Failed to reset password', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });});

  }

});router.post('/verify-token', authenticateToken, (req, res) => {

  res.json({

export default router;    success: true,

    message: 'Token is valid',
    data: {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});

export default router;
