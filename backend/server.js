const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/leaderboard', (req, res) => {
    const mockScores = [
        { rank: 1, name: 'Player1', score: 1500, level: 15, itemsCaught: 300 },
        { rank: 2, name: 'Player2', score: 1200, level: 12, itemsCaught: 240 },
        { rank: 3, name: 'Player3', score: 900, level: 9, itemsCaught: 180 },
    ];
    res.json(mockScores);
});

app.post('/api/score', (req, res) => {
    const { telegramId, score, level, itemsCaught, gameTime } = req.body;
    console.log('Score received:', { telegramId, score, level, itemsCaught, gameTime });
    res.json({ success: true, message: 'Score saved' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🐺 Yaris Lovt Dori - Telegram Mini App`);
});

module.exports = app;
