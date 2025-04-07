const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart');
const gulpSound = document.getElementById('gulpSound');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let score = 0;
let snake = [
    { x: 10, y: 10 }
];
let apple = { x: 5, y: 5 };
let velocityX = 0;
let velocityY = 0;
let speed = 1;
let gameLoop;
let appleVelocityX = speed;
let appleVelocityY = speed;
let particles = [];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.size = Math.random() * 3 + 2;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.02;
    }
}

document.addEventListener('keydown', handleKeyPress);
restartButton.addEventListener('click', startGame);

function handleKeyPress(e) {
    switch(e.key) {
        case 'ArrowUp':
            if (velocityY !== 1) {
                velocityX = 0;
                velocityY = -1;
            }
            break;
        case 'ArrowDown':
            if (velocityY !== -1) {
                velocityX = 0;
                velocityY = 1;
            }
            break;
        case 'ArrowLeft':
            if (velocityX !== 1) {
                velocityX = -1;
                velocityY = 0;
            }
            break;
        case 'ArrowRight':
            if (velocityX !== -1) {
                velocityX = 1;
                velocityY = 0;
            }
            break;
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y));
    }
}

function drawGame() {
    moveSnake();
    moveApple();

    if (isGameOver()) {
        endGame();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawApple();
    updateParticles();
    checkAppleCollision();
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

function moveSnake() {
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
    snake.unshift(head);
    if (!checkAppleCollision()) {
        snake.pop();
    }
}

function moveApple() {
    apple.x += appleVelocityX;
    apple.y += appleVelocityY;

    // Bounce off walls
    if (apple.x < 0 || apple.x >= tileCount) {
        appleVelocityX *= -1;
        apple.x = Math.max(0, Math.min(apple.x, tileCount - 1));
    }
    if (apple.y < 0 || apple.y >= tileCount) {
        appleVelocityY *= -1;
        apple.y = Math.max(0, Math.min(apple.y, tileCount - 1));
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.font = '20px Arial';
        ctx.fillText('🐍', segment.x * gridSize, (segment.y + 1) * gridSize);
    });
}

function drawApple() {
    ctx.font = '20px Arial';
    ctx.fillText('🍎', apple.x * gridSize, (apple.y + 1) * gridSize);
}

const backgroundColors = [
    '#2c3e50', '#34495e', '#8e44ad', '#2980b9', '#16a085',
    '#27ae60', '#f39c12', '#d35400', '#c0392b', '#7f8c8d'
];

function changeBackgroundColor() {
    const randomColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
    document.body.style.backgroundColor = randomColor;
}

function checkAppleCollision() {
    if (snake[0].x === Math.floor(apple.x) && snake[0].y === Math.floor(apple.y)) {
        score += 10;
        scoreElement.textContent = `Score: ${score}`;
        gulpSound.currentTime = 0;
        gulpSound.play();
        createExplosion(apple.x * gridSize, apple.y * gridSize);
        changeBackgroundColor();
        
        // Add multiple segments to make snake grow more
        const growthAmount = Math.floor(score / 50) + 3; // Snake grows more as score increases
        for (let i = 0; i < growthAmount; i++) {
            const lastSegment = snake[snake.length - 1];
            snake.push({ x: lastSegment.x, y: lastSegment.y });
        }
        
        resetApple();
        return true;
    }
    return false;
}

function resetApple() {
    apple.x = Math.floor(Math.random() * tileCount);
    apple.y = Math.floor(Math.random() * tileCount);
}

function isGameOver() {
    // Wall collision
    if (snake[0].x < 0 || snake[0].x >= tileCount || 
        snake[0].y < 0 || snake[0].y >= tileCount) {
        return true;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            return true;
        }
    }
    return false;
}

let dancingManY = 0;
let dancingDirection = 1;
let dancingRotation = 0;

function endGame() {
    clearInterval(gameLoop);
    // Start the dancing animation
    gameLoop = setInterval(drawGameOver, 50);
    restartButton.style.display = 'block';
}

function drawGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game over text
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Loser!', canvas.width / 2, canvas.height / 3);
    
    // Animate the dancing man
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 + 50 + dancingManY);
    ctx.rotate(dancingRotation);
    ctx.font = '100px Arial';
    ctx.fillText('🕺', 0, 0);
    ctx.restore();
    
    // Update dancing animation
    dancingManY += 2 * dancingDirection;
    if (Math.abs(dancingManY) > 20) {
        dancingDirection *= -1;
    }
    dancingRotation += 0.1;
}

function startGame() {
    // Reset game state
    score = 0;
    snake = [{ x: 10, y: 10 }];
    apple = { x: 5, y: 5 };
    velocityX = 1; // Start moving right by default
    velocityY = 0;
    particles = [];
    scoreElement.textContent = 'Score: 0';
    restartButton.style.display = 'none';
    document.body.style.backgroundColor = '#2c3e50';
    
    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, 100);
}

// Start initial game
startGame();
