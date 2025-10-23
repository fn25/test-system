export const up = async (queryInterface, Sequelize) => {
  await queryInterface.removeConstraint('users', 'users_username_key');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.addConstraint('users', {
    fields: ['username'],
    type: 'unique',
    name: 'users_username_key'
  });
};
