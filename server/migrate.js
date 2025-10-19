import { sequelize } from './models/index.js';
import { Sequelize, QueryInterface } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Create SequelizeMeta table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);

    // Get list of already run migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM "SequelizeMeta"'
    );
    const executedNames = executedMigrations.map(m => m.name);

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log(`📂 Found ${migrationFiles.length} migration file(s)`);

    // Run each migration that hasn't been executed yet
    for (const file of migrationFiles) {
      if (executedNames.includes(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`🔄 Running migration: ${file}`);
      
      try {
        const migrationPath = path.join(migrationsDir, file);
        const migration = await import(`file://${migrationPath}`);
        
        // Create QueryInterface instance
        const queryInterface = sequelize.getQueryInterface();
        
        // Run the migration
        await migration.up(queryInterface, Sequelize);
        
        // Record the migration as executed
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" (name) VALUES (?)',
          { replacements: [file] }
        );
        
        console.log(`✅ Migration ${file} completed successfully`);
      } catch (migrationError) {
        console.error(`❌ Error running migration ${file}:`, migrationError.message);
        throw migrationError;
      }
    }

    console.log('✅ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

runMigrations();
