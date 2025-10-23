import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    default: 'multiple-choice'
  },
  options: {
    type: [String],
    default: []
  },
  correctAnswer: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 1
  },
  timeLimit: {
    type: Number,
    default: 30
  },
  imageUrl: String
}, {
  timestamps: true
});

export default mongoose.model('Question', questionSchema);
