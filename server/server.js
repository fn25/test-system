import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models/index.js';

import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import uploadRoutes from './routes/upload.js';
import resultRoutes from './routes/result.js';
import imagekitRoutes from './routes/imagekit.js';
import { verifyEmailConfig } from './services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-app.vercel.app',
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint - MUST be before API routes
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'TestLash Tizmi API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      quiz: '/api/quiz',
      upload: '/api/upload',
      result: '/api/result',
      imagekit: '/api/imagekit'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/imagekit', imagekitRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler - MUST be last
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

const startServer = async () => {
  try {
    console.log('🔄 Starting server...');
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    console.log('🔄 Synchronizing database models...');
    try {
      await sequelize.sync({ force: false });
      console.log('✅ Database models synchronized.');
    } catch (syncError) {
      console.error('⚠️ Database sync warning:', syncError.message);
      console.log('Continuing without sync...');
    }

    // Verify email service
    console.log('🔄 Checking email service...');
    const emailReady = await verifyEmailConfig();
    if (!emailReady) {
      console.log('⚠️ Email service not configured. Password reset will not work.');
      console.log('💡 Add EMAIL_* variables to .env to enable email features.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

startServer();