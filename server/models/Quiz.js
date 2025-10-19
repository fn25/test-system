import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Quiz = sequelize.define('Quiz', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200],
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Time limit in minutes, null for no limit'
    },
    passingScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 60,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Minimum percentage to pass the quiz'
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      validate: {
        min: 1
      },
      comment: 'Maximum number of attempts allowed, null for unlimited'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether the quiz is publicly accessible'
    },
    showCorrectAnswers: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether to show correct answers after submission'
    },
    randomizeQuestions: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether to randomize question order'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    tableName: 'quizzes',
    indexes: [
      {
        fields: ['createdBy']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['isPublic']
      },
      {
        fields: ['category']
      }
    ]
  });

  return Quiz;
};