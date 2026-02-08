import 'dotenv/config';
import { Pool } from 'pg';
import { createTables } from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set in environment');
  console.error('Expected: postgresql://user:password@host:port/database');
  process.exit(1);
}

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
