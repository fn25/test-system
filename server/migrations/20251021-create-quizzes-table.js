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
    createdBy: {
      type: Sequelize.UUID,
      allowNull: false
    },
    quizCode: {
      type: Sequelize.STRING(10),
      allowNull: true,
      unique: true
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
