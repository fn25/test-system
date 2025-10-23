export const up = async (queryInterface, Sequelize) => {
  const tableInfo = await queryInterface.sequelize.query(
    `SELECT to_regclass('public.quizzes') as table_exists;`
  );

  const exists = tableInfo?.[0]?.[0]?.table_exists;
  if (!exists) {
    console.warn('Migration up: table "quizzes" does not exist. Skipping addColumn quizCode.');
    return;
  }

  const columns = await queryInterface.describeTable('quizzes');
  if (!columns.quizCode) {
    await queryInterface.addColumn('quizzes', 'quizCode', {
      type: Sequelize.STRING(10),
      allowNull: true,
      unique: true
    });
  } else {
    console.info('Migration up: column "quizCode" already exists on "quizzes". Skipping.');
  }
};

export const down = async (queryInterface, Sequelize) => {
  const tableInfo = await queryInterface.sequelize.query(
    `SELECT to_regclass('public.quizzes') as table_exists;`
  );
  const exists = tableInfo?.[0]?.[0]?.table_exists;
  if (!exists) {
    console.warn('Migration down: table "quizzes" does not exist. Nothing to remove.');
    return;
  }
  const columns = await queryInterface.describeTable('quizzes');
  if (columns.quizCode) {
    await queryInterface.removeColumn('quizzes', 'quizCode');
  } else {
    console.info('Migration down: column "quizCode" not present. Skipping.');
  }
};