export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('results', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    quizId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'quizzes',
        key: 'id'
      }
    },
    score: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    totalQuestions: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    correctAnswers: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    answers: {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    timeTaken: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    passed: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('results');
};
