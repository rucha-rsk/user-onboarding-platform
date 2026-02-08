import express from 'express';
import { User } from '../models/User.js';
import { authService } from '../services/authService.js';
import { validationService } from '../services/validationService.js';

const router = express.Router();

// Endpoint: POST /api/auth/register
// Self-registration with input validation and password hashing
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = validationService.validateRegistration(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
      });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(value.email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password and create user
    const hashedPassword = await authService.hashPassword(value.password);
    const newUser = await User.create(
      value.email,
      hashedPassword,
      value.firstName,
      value.lastName
    );

    // Emit event to queue (notification, audit log, etc.)
    // Could trigger email notification here

    res.status(201).json({
      message: 'Registration successful. Awaiting admin approval.',
      user: {
        id: newUser.id,
        email: newUser.email,
        status: newUser.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Endpoint: POST /api/auth/login
// Login for both admin and regular users
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = validationService.validateLogin(req.body);
    if (error) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = await User.findByEmail(value.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Allow admin login regardless of status, but restrict regular users
    if (user.role === 'user' && user.status !== 'APPROVED') {
      return res.status(403).json({
        error: 'Account not approved yet',
        status: user.status,
      });
    }

    const passwordMatch = await authService.comparePassword(
      value.password,
      user.password_hash
    );
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = authService.generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Endpoint: POST /api/auth/validate-token
// Validate JWT token
router.post('/validate-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ valid: false });
  }

  const decoded = authService.validateToken(token);
  res.json({ valid: !!decoded, user: decoded });
});

export default router;
