import { sequelize } from './models/index.js';

const resetMigration = async () => {
  try {
    console.log('🔄 Resetting migration...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Delete the migration record
    await sequelize.query(
      `DELETE FROM "SequelizeMeta" WHERE name = '20251020120000-add-reset-password-fields.js'`
    );
    console.log('✅ Migration record deleted');

    // Check if columns exist
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('resetPasswordToken', 'resetPasswordExpires')
    `);
    
    console.log('📋 Existing password reset columns:', columns);

    // Add columns if they don't exist
    if (!columns.find(c => c.column_name === 'resetPasswordToken')) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN "resetPasswordToken" VARCHAR(255)
      `);
      console.log('✅ Added resetPasswordToken column');
    } else {
      console.log('⏭️  resetPasswordToken column already exists');
    }

    if (!columns.find(c => c.column_name === 'resetPasswordExpires')) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN "resetPasswordExpires" TIMESTAMP WITH TIME ZONE
      `);
      console.log('✅ Added resetPasswordExpires column');
    } else {
      console.log('⏭️  resetPasswordExpires column already exists');
    }

    // Record the migration as executed
    await sequelize.query(
      `INSERT INTO "SequelizeMeta" (name) VALUES ('20251020120000-add-reset-password-fields.js')`
    );
    console.log('✅ Migration recorded');

    console.log('✅ All done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

resetMigration();
