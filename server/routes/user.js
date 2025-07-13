import express from 'express';
import { getUserStats } from '../database.js';

const router = express.Router();

// Get user statistics
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await getUserStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;