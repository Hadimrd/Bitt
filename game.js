// Game Canvas و Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// بازیکن
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 0,
    height: 0,
    speed: 5,
    health: 100,
    maxHealth: 100,
    ammo: 30,
    maxAmmo: 30,
    angle: 0
};

// متغیرهای بازی
let enemies = [];
let bullets = [];
let enemyBullets = [];
let score = 0;
let wave = 1;
let enemiesKilled = 0;
let gameOver = false;

// کلیدهای فشرده
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false,
    ' ': false
};

// عکس دشمن
const enemyImg = new Image();
enemyImg.src = 'https://github.com/Hadimrd/Bitt/blob/main/IMG_20260506_083907.jpg?raw=true';

// Event Listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') shoot();
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('click', () => {
    if (!gameOver) shoot();
});

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// تابع شوتینگ
function shoot() {
    if (player.ammo <= 0 || gameOver) return;
    
    player.ammo--;
    const bulletSpeed = 8;
    bullets.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(player.angle) * bulletSpeed,
        vy: Math.sin(player.angle) * bulletSpeed,
        radius: 5
    });
}

// اضافه کردن دشمن
function spawnEnemy() {
    const side = Math.random();
    let x, y;
    
    if (side < 0.25) {
        x = Math.random() * canvas.width;
        y = -50;
    } else if (side < 0.5) {
        x = Math.random() * canvas.width;
        y = canvas.height + 50;
    } else if (side < 0.75) {
        x = -50;
        y = Math.random() * canvas.height;
    } else {
        x = canvas.width + 50;
        y = Math.random() * canvas.height;
    }
    
    enemies.push({
        x: x,
        y: y,
        width: 40,
        height: 40,
        health: 50,
        maxHealth: 50,
        speed: 2 + wave * 0.5,
        shootTimer: 0,
        shootInterval: 60
    });
}

// حرکت بازیکن
function updatePlayer() {
    let moved = false;
    
    if (keys.ArrowUp || keys.w) {
        player.y -= player.speed;
        moved = true;
    }
    if (keys.ArrowDown || keys.s) {
        player.y += player.speed;
        moved = true;
    }
    if (keys.ArrowLeft || keys.a) {
        player.x -= player.speed;
        moved = true;
    }
    if (keys.ArrowRight || keys.d) {
        player.x += player.speed;
        moved = true;
    }
    
    // محدودیت حرکت
    player.x = Math.max(30, Math.min(canvas.width - 30, player.x));
    player.y = Math.max(30, Math.min(canvas.height - 30, player.y));
}

// حرکت گلوله‌ها
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].vx;
        bullets[i].y += bullets[i].vy;
        
        // حذف گلوله‌های خارج صفحه
        if (bullets[i].x < 0 || bullets[i].x > canvas.width ||
            bullets[i].y < 0 || bullets[i].y > canvas.height) {
            bullets.splice(i, 1);
        }
    }
}

// حرکت دشمنان
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // حرکت به سمت بازیکن
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }
        
        // شوتینگ دشمن
        enemy.shootTimer++;
        if (enemy.shootTimer >= enemy.shootInterval) {
            enemy.shootTimer = 0;
            const bulletSpeed = 4;
            const angle = Math.atan2(dy, dx);
            enemyBullets.push({
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(angle) * bulletSpeed,
                vy: Math.sin(angle) * bulletSpeed,
                radius: 5
            });
        }
        
        // حذف دشمن اگر جان تمام شده
        if (enemy.health <= 0) {
            enemies.splice(i, 1);
            score += 100;
            enemiesKilled++;
            
            // موج جدید
            if (enemiesKilled % (3 + wave) === 0) {
                wave++;
                for (let j = 0; j < 2 + wave; j++) {
                    spawnEnemy();
                }
            }
        }
    }
}

// حرکت گلوله‌های دشمن
function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].x += enemyBullets[i].vx;
        enemyBullets[i].y += enemyBullets[i].vy;
        
        // برخورد با بازیکن
        const dx = enemyBullets[i].x - player.x;
        const dy = enemyBullets[i].y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) {
            player.health -= 10;
            enemyBullets.splice(i, 1);
            continue;
        }
        
        // حذف گلوله‌های خارج صفحه
        if (enemyBullets[i].x < 0 || enemyBullets[i].x > canvas.width ||
            enemyBullets[i].y < 0 || enemyBullets[i].y > canvas.height) {
            enemyBullets.splice(i, 1);
        }
    }
}

// تشخیص برخورد
function checkCollisions() {
    // برخورد گلوله‌ها با دشمنان
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            const dx = bullets[i].x - enemies[j].x;
            const dy = bullets[i].y - enemies[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30) {
                enemies[j].health -= 25;
                bullets.splice(i, 1);
                break;
            }
        }
    }
}

// رسم بازیکن
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    
    // بدن
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(-10, -15, 20, 30);
    
    // تفنگ
    ctx.fillStyle = '#666666';
    ctx.fillRect(5, -5, 20, 10);
    
    // نوک تفنگ
    ctx.fillStyle = '#888888';
    ctx.fillRect(25, -3, 5, 6);
    
    ctx.restore();
    
    // هدف‌گیری (Crosshair)
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    const crosshairSize = 20;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - crosshairSize, canvas.height / 2);
    ctx.lineTo(canvas.width / 2 + crosshairSize, canvas.height / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2 - crosshairSize);
    ctx.lineTo(canvas.width / 2, canvas.height / 2 + crosshairSize);
    ctx.stroke();
}

// رسم دشمنان
function drawEnemies() {
    for (let enemy of enemies) {
        // رسم عکس یا مربع
        if (enemyImg.complete) {
            ctx.drawImage(enemyImg, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, 
                         enemy.width, enemy.height);
        } else {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, 
                        enemy.width, enemy.height);
        }
        
        // نوار جان
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x - 20, enemy.y - 30, 40, 5);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x - 20, enemy.y - 30, 40 * (enemy.health / enemy.maxHealth), 5);
    }
}

// رسم گلوله‌ها
function drawBullets() {
    ctx.fillStyle = '#ffff00';
    for (let bullet of bullets) {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// رسم گلوله‌های دشمن
function drawEnemyBullets() {
    ctx.fillStyle = '#ff6600';
    for (let bullet of enemyBullets) {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// رسم شبکه پس‌زمینه
function drawBackground() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }
}

// آپدیت UI
function updateUI() {
    document.getElementById('healthValue').textContent = player.health;
    document.getElementById('ammoValue').textContent = player.ammo;
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('waveValue').textContent = wave;
}

// حلقه اصلی
function gameLoop() {
    if (!gameOver) {
        // آپدیت
        updatePlayer();
        updateBullets();
        updateEnemies();
        updateEnemyBullets();
        checkCollisions();
        updateUI();
        
        // کنترل جان
        if (player.health <= 0) {
            gameOver = true;
            document.getElementById('gameOver').classList.remove('hidden');
            document.getElementById('finalScore').textContent = score;
        }
    }
    
    // رسم
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawEnemyBullets();
    
    requestAnimationFrame(gameLoop);
}

// شروع بازی
window.addEventListener('load', () => {
    // اضافه کردن دشمنان اولیه
    for (let i = 0; i < 3; i++) {
        spawnEnemy();
    }
    
    gameLoop();
    
    // تولید دشمنان جدید
    setInterval(() => {
        if (!gameOver && enemies.length < 5 + wave) {
            spawnEnemy();
        }
    }, 2000);
});