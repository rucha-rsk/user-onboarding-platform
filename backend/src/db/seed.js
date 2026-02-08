import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    console.log('Seeding database...');

    // Create default admin user
    const adminEmail = 'admin@example.com';
    const adminPassword = await bcrypt.hash('admin123456', 12);

    await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, adminPassword, 'Admin', 'User', 'admin', 'APPROVED']
    );

    console.log('✓ Admin user created (email: admin@example.com, password: admin123456)');

    // Create sample pending users
    const sampleUsers = [
      {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
      {
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      },
    ];

    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      await db.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (email) DO NOTHING`,
        [
          user.email,
          hashedPassword,
          user.firstName,
          user.lastName,
          'user',
          'PENDING',
        ]
      );
    }

    console.log('✓ Sample users created');
    console.log('✓ Seeding completed');
  } catch (err) {
    console.error('✗ Seeding failed:', err);
    process.exit(1);
  } finally {
    await db.end();
  }
}

seed();
