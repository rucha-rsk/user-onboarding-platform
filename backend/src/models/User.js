import { db } from '../server.js';

export const User = {
  async create(email, hashedPassword, firstName, lastName) {
    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, status, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, email, first_name, last_name, status, role, created_at`,
      [email, hashedPassword, firstName, lastName, 'PENDING', 'user']
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await db.query(
      'SELECT id, email, first_name, last_name, status, role, created_at, approved_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findAllPending() {
    const result = await db.query(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE status = $1 ORDER BY created_at ASC',
      ['PENDING']
    );
    return result.rows;
  },

  async updateStatus(id, status, approvedBy = null) {
    const result = await db.query(
      `UPDATE users SET status = $1, approved_at = NOW(), approved_by = $2 WHERE id = $3
       RETURNING id, email, status, approved_at`,
      [status, approvedBy, id]
    );
    return result.rows[0];
  },

  async findByRole(role) {
    const result = await db.query(
      'SELECT id, email, first_name, last_name FROM users WHERE role = $1',
      [role]
    );
    return result.rows;
  },
};
