import 'dotenv/config';
import { createClient } from 'redis';
import { Pool } from 'pg';

const redis = await createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}).connect().catch(err => {
  console.warn('Redis not available:', err.message);
  process.exit(1);
});

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const APPROVAL_QUEUE = 'approval:queue';
const BATCH_SIZE = 10;
const POLL_INTERVAL = 5000; // 5 seconds

async function processApprovalQueue() {
  try {
    // Get pending items from queue
    const items = await redis.lRange(APPROVAL_QUEUE, 0, BATCH_SIZE - 1);

    for (const item of items) {
      const { userId, action, approvedBy } = JSON.parse(item);

      try {
        // Process based on action (APPROVE, REJECT, etc.)
        if (action === 'APPROVE') {
          await db.query(
            'UPDATE users SET status = $1, approved_by = $2, approved_at = NOW() WHERE id = $3',
            ['APPROVED', approvedBy, userId]
          );
          console.log(`✓ Approved user ${userId}`);
        } else if (action === 'REJECT') {
          await db.query(
            'UPDATE users SET status = $1, approved_by = $2 WHERE id = $3',
            ['REJECTED', approvedBy, userId]
          );
          console.log(`✓ Rejected user ${userId}`);
        }

        // Remove item from queue after successful processing
        await redis.lPop(APPROVAL_QUEUE);
      } catch (err) {
        console.error(`Error processing item ${userId}:`, err.message);
        // Re-queue on error (could add retry count logic)
      }
    }
  } catch (err) {
    console.error('Queue processing error:', err);
  }
}

async function startWorker() {
  console.log('✓ Approval worker started');
  console.log(`Polling queue: ${APPROVAL_QUEUE} every ${POLL_INTERVAL}ms`);

  setInterval(processApprovalQueue, POLL_INTERVAL);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Worker shutting down...');
    await redis.quit();
    await db.end();
    process.exit(0);
  });
}

startWorker().catch(err => {
  console.error('Failed to start worker:', err);
  process.exit(1);
});
