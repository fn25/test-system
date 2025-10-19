import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const isNeon = process.env.DATABASE_URL.includes('neon.tech');
const sslConfig = isNeon ? {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
} : {};

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: sslConfig,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

import defineUser from './User.js';
import defineQuiz from './Quiz.js';
import defineQuestion from './Question.js';
import defineResult from './Result.js';

export const User = defineUser(sequelize);
export const Quiz = defineQuiz(sequelize);
export const Question = defineQuestion(sequelize);
export const Result = defineResult(sequelize);

User.hasMany(Quiz, { foreignKey: 'createdBy', as: 'createdQuizzes' });
Quiz.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Quiz.hasMany(Question, { foreignKey: 'quizId', as: 'questions', onDelete: 'CASCADE' });
Question.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

User.hasMany(Result, { foreignKey: 'userId', as: 'results' });
Result.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Quiz.hasMany(Result, { foreignKey: 'quizId', as: 'results' });
Result.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

export default {
  sequelize,
  User,
  Quiz,
  Question,
  Result
};