import express from 'express';
import { User } from '../models/User.js';
import { authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply admin authorization to all routes
router.use(authorizeAdmin);

// Endpoint: GET /api/admin/pending-users
// List all pending users awaiting approval
router.get('/pending-users', async (req, res, next) => {
  try {
    const pendingUsers = await User.findAllPending();
    res.json({
      total: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (err) {
    next(err);
  }
});

// Endpoint: PUT /api/admin/approve/:userId
// Approve a pending user
router.put('/approve/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verify user exists and is pending
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.status !== 'PENDING') {
      return res.status(400).json({
        error: `Cannot approve user with status: ${user.status}`,
      });
    }

    // Update status to APPROVED
    const updated = await User.updateStatus(userId, 'APPROVED', req.user.id);

    // Could emit event here for notification queue
    // e.g., queueService.addJob('send-approval-email', { userId })

    res.json({
      message: 'User approved successfully',
      user: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Endpoint: PUT /api/admin/reject/:userId
// Reject a pending user
router.put('/reject/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Verify user exists and is pending
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.status !== 'PENDING') {
      return res.status(400).json({
        error: `Cannot reject user with status: ${user.status}`,
      });
    }

    // Update status to REJECTED
    const updated = await User.updateStatus(userId, 'REJECTED', req.user.id);

    // Could emit event here for notification queue
    // e.g., queueService.addJob('send-rejection-email', { userId, reason })

    res.json({
      message: 'User rejected',
      user: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Endpoint: GET /api/admin/stats
// Get approval statistics
router.get('/stats', async (req, res, next) => {
  try {
    const allUsers = await User.findAllPending(); // Extend to get all stats
    res.json({
      stats: {
        pending: allUsers.length,
        // Additional stats could be queried here
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
