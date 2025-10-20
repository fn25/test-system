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

async function makeQuizzesPublic() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Update all quizzes to be public
    const [results] = await sequelize.query(
      `UPDATE quizzes SET "isPublic" = true WHERE "isPublic" = false;`
    );

    console.log(`Updated ${results} quizzes to public.`);

    // Show all quizzes
    const [quizzes] = await sequelize.query(
      `SELECT id, title, "isPublic", "createdBy" FROM quizzes;`
    );

    console.log('\nAll quizzes:');
    console.table(quizzes);

    await sequelize.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

makeQuizzesPublic();
