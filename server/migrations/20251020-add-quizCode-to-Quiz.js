export const up = async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('quizzes', 'quizCode', {
    type: Sequelize.STRING(8),
    allowNull: true,
    unique: true,
    validate: {
      len: [6, 8],
      isUppercase: true,
      isAlphanumeric: true,
    },
    comment: 'Unique code for guest access to quiz',
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn('quizzes', 'quizCode');
};