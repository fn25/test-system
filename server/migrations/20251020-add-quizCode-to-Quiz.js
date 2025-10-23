export const up = async (queryInterface, Sequelize) => {
  // Ensure the quizzes table exists before attempting to alter it.
  // Some deployment environments (render/vercel) may run this migration against a DB where the original
  // create-table migration hasn't been applied yet. Instead of failing, we'll check and skip gracefully.
  const tableInfo = await queryInterface.sequelize.query(
    `SELECT to_regclass('public.quizzes') as table_exists;`
  );

  const exists = tableInfo?.[0]?.[0]?.table_exists;
  if (!exists) {
    // Table doesn't exist; log and skip adding the column. The next successful run (after create-table migration)
    // will pick up the change or you can re-run this migration manually.
    console.warn('Migration up: table "quizzes" does not exist. Skipping addColumn quizCode.');
    return;
  }

  // Add column if it doesn't already exist
  const columns = await queryInterface.describeTable('quizzes');
  if (!columns.quizCode) {
    await queryInterface.addColumn('quizzes', 'quizCode', {
      type: Sequelize.STRING(8),
      allowNull: true,
      unique: true,
      comment: 'Unique code for guest access to quiz'
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