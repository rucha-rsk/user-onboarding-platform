import express from 'express';
import { User } from '../models/User.js';
import { authorizeUser } from '../middleware/auth.js';

const router = express.Router();

// Apply user authorization to all routes
router.use(authorizeUser);

// Endpoint: GET /api/user/profile
// Get current user's profile and approval status
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        status: user.status,
        role: user.role,
        createdAt: user.created_at,
        approvedAt: user.approved_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Endpoint: GET /api/user/status
// Simple status check for polling
router.get('/status', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      status: user.status,
      approvedAt: user.approved_at,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
