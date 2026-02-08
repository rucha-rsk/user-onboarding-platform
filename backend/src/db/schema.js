import { db } from '../server.js';

export const createTables = async () => {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'PENDING',
        approved_by INT,
        created_at TIMESTAMP DEFAULT NOW(),
        approved_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT valid_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE')),
        CONSTRAINT valid_role CHECK (role IN ('user', 'admin'))
      );
    `);

    // Create indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);

    // Create audit log table
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100),
        resource_id INT,
        changes JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Create approval queue table
    await db.query(`
      CREATE TABLE IF NOT EXISTS approval_queue (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        status VARCHAR(50) DEFAULT 'PENDING',
        enqueued_at TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('✓ Database tables created successfully');
    return true;
  } catch (err) {
    console.error('✗ Error creating tables:', err);
    throw err;
  }
};
