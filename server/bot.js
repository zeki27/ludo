import TelegramBot from 'node-telegram-bot-api';
import { createUser, getUserStats } from './database.js';

const BOT_TOKEN = '7765267207:AAFVHZ9dfwJdoJAld8pCN8JltOxseJNGjwc';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-app-domain.com';

let bot;
let gameManager;

export function initBot(gameManagerInstance) {
  gameManager = gameManagerInstance;
  bot = new TelegramBot(BOT_TOKEN, { polling: true });

  // Handle /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;

    // Create user in database
    await createUser(userId, username);

    const welcomeMessage = `
🎲 Welcome to Ludo Game!

Play the classic board game with friends or random players worldwide!

🎮 Game Modes:
• Quick Match - Play with random players
• Private Game - Invite friends with a code

📱 Tap the button below to start playing!
    `;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎮 Play Ludo',
              web_app: { url: WEBAPP_URL }
            }
          ],
          [
            { text: '📊 My Stats', callback_data: 'stats' },
            { text: '❓ How to Play', callback_data: 'help' }
          ]
        ]
      }
    };

    bot.sendMessage(chatId, welcomeMessage, options);
  });

  // Handle /join command with game code
  bot.onText(/\/join (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const gameCode = match[1];

    const game = gameManager.getGameByCode(gameCode);
    if (!game) {
      bot.sendMessage(chatId, '❌ Invalid game code. Please check and try again.');
      return;
    }

    if (game.players.length >= 4) {
      bot.sendMessage(chatId, '❌ This game is full. Try creating a new game!');
      return;
    }

    const joinUrl = `${WEBAPP_URL}?game=${game.id}`;
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎮 Join Game',
              web_app: { url: joinUrl }
            }
          ]
        ]
      }
    };

    bot.sendMessage(chatId, `🎲 Join the Ludo game!\n\nGame Code: ${gameCode}`, options);
  });

  // Handle /create command
  bot.onText(/\/create/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const game = gameManager.createPrivateGame(userId);
    const gameUrl = `${WEBAPP_URL}?game=${game.id}`;
    const shareUrl = `https://t.me/${bot.options.username}?start=join_${game.code}`;

    const message = `
🎲 Private Game Created!

Game Code: \`${game.code}\`

Share this link with friends:
${shareUrl}

Or tap the button below to start playing:
    `;

    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎮 Start Game',
              web_app: { url: gameUrl }
            }
          ],
          [
            { text: '📤 Share Game', switch_inline_query: `Join my Ludo game! Code: ${game.code}` }
          ]
        ]
      }
    };

    bot.sendMessage(chatId, message, options);
  });

  // Handle callback queries
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;

    if (data === 'stats') {
      const stats = await getUserStats(userId);
      const message = `
📊 Your Ludo Stats

🎮 Games Played: ${stats.games_played}
🏆 Games Won: ${stats.games_won}
💔 Games Lost: ${stats.games_lost}
🎯 Win Rate: ${stats.games_played > 0 ? Math.round((stats.games_won / stats.games_played) * 100) : 0}%

Keep playing to improve your stats!
      `;

      bot.answerCallbackQuery(query.id);
      bot.sendMessage(chatId, message);
    } else if (data === 'help') {
      const helpMessage = `
❓ How to Play Ludo

🎯 Objective: Move all 4 tokens from start to home area

🎲 Rules:
• Roll 6 to start a token
• Roll 6 to get extra turn
• Capture opponents by landing on them
• Safe spots protect your tokens
• Exact count needed to reach home

🎮 Controls:
• Tap dice to roll
• Tap token to move
• Follow the highlighted path

Good luck and have fun! 🍀
      `;

      bot.answerCallbackQuery(query.id);
      bot.sendMessage(chatId, helpMessage);
    }
  });

  console.log('Telegram bot initialized');
}

export function sendGameUpdate(userId, message) {
  if (bot) {
    bot.sendMessage(userId, message);
  }
}