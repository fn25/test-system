import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizCode: {
    type: String,
    unique: true,
    sparse: true
  },
  isLive: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  startTime: Date,
  endTime: Date
}, {
  timestamps: true
});

export default mongoose.model('Quiz', quizSchema);
