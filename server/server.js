import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models/index.js';
import { Sequelize } from 'sequelize';
import fs from 'fs';

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
  'https://test-system-m83sglvo8-sardors-projects-0bb5ea52.vercel.app',
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Allow all Vercel preview/production domains
    if (origin && (origin.endsWith('.vercel.app') || origin.endsWith('.vercel.com'))) {
      return callback(null, true);
    }
    
    // Allow in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Log rejected origin for debugging
    console.log('❌ CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

// Migration runner function
const runMigrations = async () => {
  try {
    // Create SequelizeMeta table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);

    // Get list of already run migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM "SequelizeMeta"'
    );
    const executedNames = executedMigrations.map(m => m.name);

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('📂 No migrations directory found, skipping migrations');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('📂 No migration files found');
      return;
    }

    console.log(`📂 Found ${migrationFiles.length} migration file(s)`);

    // Run each migration that hasn't been executed yet
    for (const file of migrationFiles) {
      if (executedNames.includes(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`🔄 Running migration: ${file}`);
      
      try {
        const migrationPath = path.join(migrationsDir, file);
        const migration = await import(`file://${migrationPath}`);
        
        // Create QueryInterface instance
        const queryInterface = sequelize.getQueryInterface();
        
        // Run the migration
        await migration.up(queryInterface, Sequelize);
        
        // Record the migration as executed
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" (name) VALUES (?)',
          { replacements: [file] }
        );
        
        console.log(`✅ Migration ${file} completed successfully`);
      } catch (migrationError) {
        console.error(`❌ Error running migration ${file}:`, migrationError.message);
        throw migrationError;
      }
    }

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  }
};

const startServer = async () => {
  try {
    console.log('🔄 Starting server...');
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    console.log('🔄 Running database migrations...');
    try {
      // Run migrations programmatically
      await runMigrations();
      console.log('✅ Database migrations completed.');
    } catch (migrationError) {
      console.error('⚠️ Migration warning:', migrationError.message);
      console.log('Continuing without migrations...');
    }

    console.log('🔄 Synchronizing database models...');
    try {
      await sequelize.sync({ alter: false });
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