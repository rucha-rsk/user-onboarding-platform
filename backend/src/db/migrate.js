import 'dotenv/config';
import { Pool } from 'pg';
import { createTables } from './schema.js';

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    console.log('Running migrations...');
    await createTables();
    console.log('✓ Migrations completed');
  } catch (err) {
    console.error('✗ Migration failed:', err);
    process.exit(1);
  } finally {
    await db.end();
  }
}

migrate();
