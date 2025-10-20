import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

async function addLiveQuizFields() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // Create enum type if not exists
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_quizzes_startMode AS ENUM ('auto', 'manual');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Created/verified startMode enum type');

    // Add isLive column if not exists
    await sequelize.query(`
      ALTER TABLE quizzes 
      ADD COLUMN IF NOT EXISTS "isLive" BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log('✅ Added isLive column');

    // Add startMode column if not exists
    await sequelize.query(`
      ALTER TABLE quizzes 
      ADD COLUMN IF NOT EXISTS "startMode" enum_quizzes_startMode NOT NULL DEFAULT 'auto';
    `);
    console.log('✅ Added startMode column');

    // Add showCorrectAnswers column if not exists
    await sequelize.query(`
      ALTER TABLE quizzes 
      ADD COLUMN IF NOT EXISTS "showCorrectAnswers" BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log('✅ Added showCorrectAnswers column');

    // Add randomizeQuestions column if not exists
    await sequelize.query(`
      ALTER TABLE quizzes 
      ADD COLUMN IF NOT EXISTS "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log('✅ Added randomizeQuestions column');

    // Show table structure
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'quizzes' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Quiz table structure:');
    console.table(columns);

    await sequelize.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addLiveQuizFields();
