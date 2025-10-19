import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Result = sequelize.define('Result', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Score as percentage (0-100)'
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    correctAnswers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    pointsEarned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Time spent in seconds'
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of user answers with question IDs and selected answers'
    },
    isPassed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    attemptNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
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
    tableName: 'results',
    indexes: [
      { fields: ['userId'] },
      { fields: ['quizId'] },
      { fields: ['userId', 'quizId'] },
      { fields: ['isPassed'] },
      { fields: ['score'] }
    ],
    validate: {
      pointsValidation() {
        if (this.pointsEarned > this.totalPoints) {
          throw new Error('Points earned cannot exceed total points');
        }
      },
      correctAnswersValidation() {
        if (this.correctAnswers > this.totalQuestions) {
          throw new Error('Correct answers cannot exceed total questions');
        }
      },
      timeValidation() {
        if (this.startedAt && this.completedAt && this.completedAt < this.startedAt) {
          throw new Error('Completion time cannot be before start time');
        }
      }
    }
  });

  Result.prototype.calculatePassed = function(passingScore = 60) {
    return this.score >= passingScore;
  };

  return Result;
};