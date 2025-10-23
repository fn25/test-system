export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('questions', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    quizId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'quizzes',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'multiple-choice'
    },
    options: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: []
    },
    correctAnswer: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: true
    },
    videoUrl: {
      type: Sequelize.STRING,
      allowNull: true
    },
    order: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
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
  await queryInterface.dropTable('questions');
};
