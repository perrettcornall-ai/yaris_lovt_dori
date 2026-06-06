const tg = window.Telegram?.WebApp || { 
    ready: () => {}, 
    expand: () => {},
    initData: '',
    shareToStory: null
};

if (tg.ready) tg.ready();
if (tg.expand) tg.expand();

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
    console.log('Game initialized');
});

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    console.log('Canvas initialized:', { width: canvas.width, height: canvas.height });

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
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            console.log('Play button clicked');
            startGame();
        });
    }
    
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    if (leaderboardBtn) leaderboardBtn.addEventListener('click', showLeaderboard);
    
    const aboutBtn = document.getElementById('aboutBtn');
    if (aboutBtn) aboutBtn.addEventListener('click', showAbout);

    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
    
    const pauseMenu = document.getElementById('pauseMenu');
    if (pauseMenu) {
        pauseMenu.addEventListener('click', (e) => {
            if (e.target.id === 'pauseMenu') resumeGame();
        });
    }

    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) resumeBtn.addEventListener('click', resumeGame);
    
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            gameOver();
            startGame();
        });
    }
    
    const mainMenuBtn = document.getElementById('mainMenuBtn');
    if (mainMenuBtn) {
        mainMenuBtn.addEventListener('click', () => {
            gameOver();
            showMenu();
        });
    }

    const restartGameBtn = document.getElementById('restartGameBtn');
    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', () => {
            showMenu();
            setTimeout(() => startGame(), 100);
        });
    }
    
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) shareBtn.addEventListener('click', shareScore);
    
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    if (backToMenuBtn) backToMenuBtn.addEventListener('click', showMenu);

    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', showMenu);
    
    const backAboutBtn = document.getElementById('backAboutBtn');
    if (backAboutBtn) backAboutBtn.addEventListener('click', showMenu);

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

    if (canvas) {
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
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
    }
    console.log('Showing screen:', screenId);
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
    console.log('Starting game...');
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

    console.log('Game state changed to:', gameState);
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
    const pauseScore = document.getElementById('pauseScore');
    if (pauseScore) {
        pauseScore.textContent = `Текущий счет: ${score} ₿`;
    }
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
    const finalScore = document.getElementById('finalScore');
    const itemsCaughtEl = document.getElementById('itemsCaught');
    const gameTimeEl = document.getElementById('gameTime');

    if (finalScore) finalScore.textContent = `${score} ₿`;
    if (itemsCaughtEl) itemsCaughtEl.textContent = itemsCaught;
    
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    if (gameTimeEl) gameTimeEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
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
    const scoreEl = document.getElementById('score');
    const comboEl = document.getElementById('combo');
    const levelEl = document.getElementById('level');

    if (scoreEl) scoreEl.textContent = `${score} ₿`;
    if (comboEl) comboEl.textContent = `Combo: ${combo}x`;
    if (levelEl) levelEl.textContent = `Уровень: ${level}`;
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
    if (!ctx) return;

    // Рисуем небо с градиентом
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Рисуем облака
    drawClouds();

    // Рисуем травку внизу
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);

    // Рисуем предметы
    itemsManager.draw(ctx);

    // Рисуем персонажа
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
    const leaderboardList = document.getElementById('leaderboardList');
    if (leaderboardList) {
        leaderboardList.innerHTML = '<div class="loading">Загрузка...</div>';
    }

    try {
        const mockData = [
            { rank: 1, name: 'Player1', score: 1500, level: 15, itemsCaught: 300 },
            { rank: 2, name: 'Player2', score: 1200, level: 12, itemsCaught: 240 },
            { rank: 3, name: 'Player3', score: 900, level: 9, itemsCaught: 180 },
        ];

        if (leaderboardList) {
            leaderboardList.innerHTML = '';

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
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        if (leaderboardList) {
            leaderboardList.innerHTML = '<div class="loading">Ошибка загрузки</div>';
        }
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
