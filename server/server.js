import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initBot } from './bot.js';
import { initDatabase } from './database.js';
import gameRoutes from './routes/game.js';
import userRoutes from './routes/user.js';
import { GameManager } from './gameManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

// Initialize database
await initDatabase();

// Initialize game manager
const gameManager = new GameManager(io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://telegram.org"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"]
    }
  }
}));

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../dist')));

// API routes
app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);

// Pass gameManager to routes
app.use((req, res, next) => {
  req.gameManager = gameManager;
  next();
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-game', async (data) => {
    const { gameId, userId } = data;
    await gameManager.joinGame(socket, gameId, userId);
  });

  socket.on('roll-dice', async (data) => {
    const { gameId, userId } = data;
    await gameManager.rollDice(gameId, userId);
  });

  socket.on('move-token', async (data) => {
    const { gameId, userId, tokenId, steps } = data;
    await gameManager.moveToken(gameId, userId, tokenId, steps);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    gameManager.handleDisconnect(socket);
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Initialize Telegram bot
initBot(gameManager);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});