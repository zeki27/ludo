import express from 'express';
import { loadGame } from '../database.js';

const router = express.Router();

// Get game state
router.get('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await loadGame(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create quick match
router.post('/quick-match', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Handle through game manager
    const gameManager = req.gameManager;
    const game = await gameManager.createQuickMatch(userId);
    
    res.json({ gameId: game.id });
  } catch (error) {
    console.error('Error creating quick match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;