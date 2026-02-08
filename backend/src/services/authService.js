import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12;

export const authService = {
  async hashPassword(password) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  },

  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
  },

  generateRefreshToken(user) {
    const payload = { id: user.id, email: user.email };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  },

  validateToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return null;
    }
  },
};
