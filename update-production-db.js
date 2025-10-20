import { Sequelize } from 'sequelize';

// Production database URL
const DATABASE_URL = 'postgresql://neondb_owner:npg_mDle56rIjyat@ep-small-sun-adywycce-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

async function updateProductionDatabase() {
  try {
    console.log('🔄 Connecting to production database...');
    await sequelize.authenticate();
    console.log('✅ Connected to production database successfully.\n');

    // 1. Add missing columns if they don't exist
    console.log('🔄 Adding missing columns...');
    
    const addColumnsSQL = `
      -- Add isLive column if not exists
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='quizzes' AND column_name='isLive') THEN
          ALTER TABLE quizzes ADD COLUMN "isLive" BOOLEAN DEFAULT false;
          RAISE NOTICE 'Added isLive column';
        END IF;
      END $$;

      -- Add startMode column if not exists
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='quizzes' AND column_name='startMode') THEN
          CREATE TYPE enum_quizzes_startMode AS ENUM ('auto', 'manual');
          ALTER TABLE quizzes ADD COLUMN "startMode" enum_quizzes_startMode DEFAULT 'auto';
          RAISE NOTICE 'Added startMode column';
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='quizzes' AND column_name='startMode') THEN
            ALTER TABLE quizzes ADD COLUMN "startMode" enum_quizzes_startMode DEFAULT 'auto';
            RAISE NOTICE 'Added startMode column (type already existed)';
          END IF;
      END $$;

      -- Add showCorrectAnswers column if not exists
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='quizzes' AND column_name='showCorrectAnswers') THEN
          ALTER TABLE quizzes ADD COLUMN "showCorrectAnswers" BOOLEAN DEFAULT false;
          RAISE NOTICE 'Added showCorrectAnswers column';
        END IF;
      END $$;

      -- Add randomizeQuestions column if not exists
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='quizzes' AND column_name='randomizeQuestions') THEN
          ALTER TABLE quizzes ADD COLUMN "randomizeQuestions" BOOLEAN DEFAULT false;
          RAISE NOTICE 'Added randomizeQuestions column';
        END IF;
      END $$;
    `;

    await sequelize.query(addColumnsSQL);
    console.log('✅ Missing columns added successfully.\n');

    // 2. Make all quizzes public
    console.log('🔄 Making all quizzes public...');
    const [updateResult] = await sequelize.query(
      `UPDATE quizzes SET "isPublic" = true WHERE "isPublic" = false RETURNING id;`
    );
    console.log(`✅ Updated ${updateResult.length} quizzes to public.\n`);

    // 3. Show current quizzes
    console.log('📊 Current quizzes in database:');
    const [quizzes] = await sequelize.query(
      `SELECT id, title, "isPublic", "isLive", "startMode", "createdBy" FROM quizzes ORDER BY "createdAt" DESC;`
    );
    console.table(quizzes);

    await sequelize.close();
    console.log('\n✅ All operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateProductionDatabase();
