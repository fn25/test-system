export const up = async (queryInterface, Sequelize) => {
  // Check if columns already exist before adding
  const tableDescription = await queryInterface.describeTable('users');
  
  if (!tableDescription.resetPasswordToken) {
    await queryInterface.addColumn('users', 'resetPasswordToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
  
  if (!tableDescription.resetPasswordExpires) {
    await queryInterface.addColumn('users', 'resetPasswordExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn('users', 'resetPasswordToken');
  await queryInterface.removeColumn('users', 'resetPasswordExpires');
};
