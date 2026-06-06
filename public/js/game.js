const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let gameState = 'menu';
let canvas = null;
let ctx = null;
let player = null;
let itemsManager = null;
let score = 0;
let combo = 0;
let level = 1;
let gameTime = 0;
let itemsCaught = 0;
let gameStartTime = 0;
let isPaused = false;
let isGameRunning = false;
let userTelegramId = '000000';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const INITIAL_SPAWN_RATE = 0.02;

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
});

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    player = new Player(GAME_WIDTH / 2 - 20, GAME_HEIGHT - 100, 40, 50);
    itemsManager = new ItemsManager();

    if (tg.initData) {
        try {
            const initData = new URLSearchParams(tg.initData);
            const user = initData.get('user');
            if (user) {
                userTelegramId = JSON.parse(user).id;
            }
        } catch (e) {
            console.error('Error parsing Telegram user:', e);
        }
    }
}

function setupEventListeners() {
    document.getElementById('playBtn').addEventListener('click', startGame);
    document.getElementById('leaderboardBtn').addEventListener('click', showLeaderboard);
    document.getElementById('aboutBtn').addEventListener('click', showAbout);

    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('pauseMenu').addEventListener('click', (e) => {
        if (e.target.id === 'pauseMenu') resumeGame();
    });
    document.getElementById('resumeBtn').addEventListener('click', resumeGame);
    document.getElementById('restartBtn').addEventListener('click', () => {
        gameOver();
        startGame();
    });
    document.getElementById('mainMenuBtn').addEventListener('click', () => {
        gameOver();
        showMenu();
    });

    document.getElementById('restartGameBtn').addEventListener('click', () => {
        showMenu();
        setTimeout(() => startGame(), 100);
    });
    document.getElementById('shareBtn').addEventListener('click', shareScore);
    document.getElementById('backToMenuBtn').addEventListener('click', showMenu);

    document.getElementById('backBtn').addEventListener('click', showMenu);
    document.getElementById('backAboutBtn').addEventListener('click', showMenu);

    document.addEventListener('keydown', (e) => {
        if (gameState === 'playing' && !isPaused) {
            if (e.key === 'ArrowLeft') player.isMovingLeft = true;
            if (e.key === 'ArrowRight') player.isMovingRight = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') player.isMovingLeft = false;
        if (e.key === 'ArrowRight') player.isMovingRight = false;
    });

    canvas.addEventListener('touchstart', (e) => {
        if (gameState === 'playing' && !isPaused) {
            const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
            const playerCenterX = player.x + player.width / 2;

            if (touchX < playerCenterX) {
                player.isMovingLeft = true;
            } else {
                player.isMovingRight = true;
            }
        }
    });

    canvas.addEventListener('touchend', () => {
        player.isMovingLeft = false;
        player.isMovingRight = false;
    });

    canvas.addEventListener('touchmove', (e) => {
        if (gameState === 'playing' && !isPaused) {
            const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
            const playerCenterX = player.x + player.width / 2;

            player.isMovingLeft = touchX < playerCenterX;
            player.isMovingRight = touchX > playerCenterX;
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (gameState === 'playing' && !isPaused) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const playerCenterX = player.x + player.width / 2;

            player.isMovingLeft = mouseX < playerCenterX;
            player.isMovingRight = mouseX > playerCenterX;
        }
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function showMenu() {
    gameState = 'menu';
    showScreen('mainMenu');
    score = 0;
    combo = 0;
    level = 1;
    itemsCaught = 0;
}

function startGame() {
    gameState = 'playing';
    showScreen('gameScreen');
    isGameRunning = true;
    isPaused = false;
    gameStartTime = Date.now();
    score = 0;
    combo = 0;
    level = 1;
    itemsCaught = 0;
    gameTime = 0;
    player.setPosition(GAME_WIDTH / 2 - 20, GAME_HEIGHT - 100);
    itemsManager.clear();
    itemsManager.level = 1;
    itemsManager.spawnRate = INITIAL_SPAWN_RATE;

    gameLoop();
}

function togglePause() {
    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function pauseGame() {
    isPaused = true;
    document.getElementById('pauseScore').textContent = `Текущий счет: ${score} ₿`;
    showScreen('pauseMenu');
}

function resumeGame() {
    isPaused = false;
    showScreen('gameScreen');
    gameStartTime = Date.now() - gameTime * 1000;
    gameLoop();
}

function gameOver() {
    isGameRunning = false;
    gameState = 'gameOver';
    saveScore();
    showGameOverScreen();
}

function showGameOverScreen() {
    document.getElementById('finalScore').textContent = `${score} ₿`;
    document.getElementById('itemsCaught').textContent = itemsCaught;
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    document.getElementById('gameTime').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    showScreen('gameOverScreen');
}

function gameLoop() {
    if (!isGameRunning || isPaused) return;

    gameTime = Math.floor((Date.now() - gameStartTime) / 1000);

    updateUI();
    player.update(GAME_WIDTH);
    itemsManager.spawnItem(GAME_WIDTH);
    itemsManager.update(GAME_HEIGHT);
    checkCollisions();
    checkLevelUp();
    drawScene();

    requestAnimationFrame(gameLoop);
}

function updateUI() {
    document.getElementById('score').textContent = `${score} ₿`;
    document.getElementById('combo').textContent = `Combo: ${combo}x`;
    document.getElementById('level').textContent = `Уровень: ${level}`;
}

function checkCollisions() {
    for (let i = itemsManager.items.length - 1; i >= 0; i--) {
        if (player.isCollidingWith(itemsManager.items[i])) {
            const item = itemsManager.getAndRemoveItem(i);
            handleItemCaught(item);
        }
    }
}

function handleItemCaught(item) {
    itemsCaught++;
    combo++;

    let points = 0;
    switch (item.type) {
        case 'gold':
            points = 10;
            break;
        case 'silver':
            points = 5;
            break;
        case 'bomb':
            points = -10;
            combo = 0;
            break;
    }

    const comboMultiplier = Math.floor(combo / 5);
    const finalPoints = points * (1 + comboMultiplier);

    score += finalPoints;
    if (score < 0) score = 0;
}

function checkLevelUp() {
    const newLevel = Math.floor(score / 100) + 1;
    if (newLevel > level) {
        level = newLevel;
        itemsManager.increaseLevel();
    }
}

function drawScene() {
    ctx.fillStyle = 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)';
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    drawClouds();

    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);

    itemsManager.draw(ctx);
    player.draw(ctx);
}

function drawClouds() {
    const cloudOffset = (Date.now() * 0.02) % (GAME_WIDTH + 100);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    drawCloud(cloudOffset - 100, 50, 60);
    drawCloud(cloudOffset + 150, 100, 50);
    drawCloud(cloudOffset - 50, 150, 45);
}

function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.5, y - size * 0.5, size, 0, Math.PI * 2);
    ctx.arc(x + size, y, size, 0, Math.PI * 2);
    ctx.fill();
}

async function showLeaderboard() {
    showScreen('leaderboardScreen');
    document.getElementById('leaderboardList').innerHTML = '<div class="loading">Загрузка...</div>';

    try {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';

        const mockData = [
            { rank: 1, name: 'Player1', score: 1500, level: 15, itemsCaught: 300 },
            { rank: 2, name: 'Player2', score: 1200, level: 12, itemsCaught: 240 },
            { rank: 3, name: 'Player3', score: 900, level: 9, itemsCaught: 180 },
        ];

        mockData.forEach((player) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';

            let rankClass = '';
            let medal = '';
            if (player.rank === 1) {
                rankClass = 'top1';
                medal = '🥇';
            } else if (player.rank === 2) {
                rankClass = 'top2';
                medal = '🥈';
            } else if (player.rank === 3) {
                rankClass = 'top3';
                medal = '🥉';
            }

            item.innerHTML = `
                <span class="rank ${rankClass}">${medal} ${player.rank}</span>
                <div class="player-name">${player.name}</div>
                <span class="player-score">${player.score} ₿</span>
            `;

            leaderboardList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        document.getElementById('leaderboardList').innerHTML = '<div class="loading">Ошибка загрузки</div>';
    }
}

function showAbout() {
    showScreen('aboutScreen');
}

async function saveScore() {
    try {
        console.log('Score saved:', {
            telegramId: userTelegramId,
            score: score,
            level: level,
            itemsCaught: itemsCaught,
            gameTime: gameTime
        });
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

function shareScore() {
    const message = `🐺 Я получил ${score} ₿ в игре Yaris Lovt Dori!\n🏆 Уровень: ${level}\n⏱ Время: ${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}\n\nПопробуй и ты! 🎮`;

    if (tg.shareToStory) {
        tg.shareToStory(message);
    } else {
        const shareUrl = `https://t.me/share/url?url=https://t.me/yaris_lovt_dori_bot&text=${encodeURIComponent(message)}`;
        window.open(shareUrl, '_blank');
    }
}
