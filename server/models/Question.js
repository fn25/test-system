import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Question = sequelize.define('Question', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 2000]
      }
    },
    type: {
      type: DataTypes.ENUM('multiple_choice', 'true_false', 'short_answer'),
      allowNull: false,
      defaultValue: 'multiple_choice'
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true
    },
    correctAnswer: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    quizId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'quizzes',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    tableName: 'questions',
    indexes: [
      {
        fields: ['quizId']
      },
      {
        fields: ['quizId', 'order']
      }
    ],
    validate: {
      optionsRequiredForMultipleChoice() {
        if (this.type === 'multiple_choice' && (!this.options || !Array.isArray(this.options) || this.options.length < 2)) {
          throw new Error('Multiple choice questions must have at least 2 options');
        }
      },
      correctAnswerFormat() {
        if (this.type === 'multiple_choice') {
          const answerIndex = parseInt(this.correctAnswer);
          if (isNaN(answerIndex) || answerIndex < 0 || (this.options && answerIndex >= this.options.length)) {
            throw new Error('Correct answer must be a valid option index for multiple choice questions');
          }
        } else if (this.type === 'true_false') {
          if (this.correctAnswer !== 'true' && this.correctAnswer !== 'false') {
            throw new Error('Correct answer must be "true" or "false" for true/false questions');
          }
        }
      }
    }
  });

  return Question;
};