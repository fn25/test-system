export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('quizzes', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    instructions: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    timeLimit: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    passingScore: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 60
    },
    maxAttempts: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    isPublic: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    isLive: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    startMode: {
      type: Sequelize.ENUM('auto', 'manual'),
      defaultValue: 'auto'
    },
    showCorrectAnswers: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    randomizeQuestions: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    category: {
      type: Sequelize.STRING,
      allowNull: true
    },
    difficulty: {
      type: Sequelize.ENUM('easy', 'medium', 'hard'),
      allowNull: true
    },
    createdBy: {
      type: Sequelize.UUID,
      allowNull: false
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
  await queryInterface.dropTable('quizzes');
};
