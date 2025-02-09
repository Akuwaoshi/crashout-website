const gameState = {
    score: 0,
    isPlaying: false,
    player: { x: 50, y: 100, vy: 0 },
    grade: { x: 300, y: 80 },
    platforms: [[0, 150], [200, 120], [350, 150]],
    fragments: 0,
    herAffection: 0
};

let guitarImage;
let audioSystem;

// Starfield Generation
function createStarfield() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)
    );
    gradient.addColorStop(0, '#102040');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    for(let i = 0; i < 200; i++) {
        ctx.beginPath();
        ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 2,
            0, Math.PI * 2
        );
        ctx.fill();
    }
    document.getElementById('starfield').appendChild(canvas);
}

// Guitar Sprite Generation
function generateGuitar() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 200;
    
    ctx.fillStyle = '#2b1700';
    ctx.beginPath();
    ctx.moveTo(30, 50);
    ctx.bezierCurveTo(0, 100, 100, 100, 70, 50);
    ctx.lineTo(50, 180);
    ctx.bezierCurveTo(40, 190, 60, 190, 50, 180);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#cccccc';
    for(let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(20 + i * 10, 30);
        ctx.lineTo(20 + i * 10, 170);
        ctx.stroke();
    }
    return canvas;
}

// Audio System
class AudioSystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.ctx.destination);
        this.gainNode.gain.value = 0.1;
    }

    playJump() {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.connect(this.gainNode);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playCollect() {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.connect(this.gainNode);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }
}

// Game Core
function initGame() {
    createStarfield();
    guitarImage = generateGuitar();
    audioSystem = new AudioSystem();
    
    const canvas = document.getElementById('gameCanvas');
    canvas.style.display = 'block';
    canvas.width = 400;
    canvas.height = 300;
    
    document.getElementById('game-ui').style.display = 'none';
    gameState.isPlaying = true;
    gameLoop();
}

function gameLoop() {
    if (!gameState.isPlaying) return;

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Physics
    gameState.player.y += gameState.player.vy;
    gameState.player.vy += 0.5;

    // Collision
    gameState.platforms.forEach(plat => {
        if (isColliding(plat)) {
            gameState.player.y = plat[1] - 60;
            gameState.player.vy = 0;
        }
    });

    // Grade collection
    if (Math.abs(gameState.grade.x - gameState.player.x) < 30 && 
        Math.abs(gameState.grade.y - gameState.player.y) < 30) {
        gameState.score++;
        document.getElementById('grade-count').textContent = gameState.score;
        gameState.grade.x = Math.random() * (canvas.width - 30);
        gameState.grade.y = Math.random() * (canvas.height/2);
        audioSystem.playCollect();
        
        if (gameState.score >= 7) showEnding();
    }

    // Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Platforms
    ctx.fillStyle = '#1a1a40';
    gameState.platforms.forEach(plat => {
        ctx.fillRect(plat[0], plat[1], 100, 20);
    });

    // Player
    ctx.drawImage(guitarImage, gameState.player.x, gameState.player.y, 30, 60);

    // Grade
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(gameState.grade.x, gameState.grade.y, 10, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

function isColliding(platform) {
    return (
        gameState.player.x < platform[0] + 100 &&
        gameState.player.x + 30 > platform[0] &&
        gameState.player.y + 60 > platform[1] &&
        gameState.player.y < platform[1] + 20
    );
}

function showEnding() {
    const endingDiv = document.getElementById('ending');
    endingDiv.style.display = 'block';
    endingDiv.innerHTML = `
        AFTER 7 FUCKING WEEKS OF:<br>
        - GRINDING ALGEBRA<br>
        - FAKING CONFIDENCE<br>
        - DRAWING HER 127 TIMES<br><br>
        YOU DID IT...<br>
        [CLICK ANYWHERE TO CONTINUE]
    `;

    endingDiv.onclick = () => {
        endingDiv.innerHTML = `
            <div style="text-align: center">
                <canvas id="ending-guitar"></canvas><br>
                DAD KEPT HIS PROMISE.<br>
                SHE ACTUALLY LIKED YOU.<br>
                YOU'RE NOT MID ANYMORE.<br><br>
                CREDITS:<br>
                - Adam (Akuwa/Aquamarine)<br>
                - Your fucking persistence
            </div>
        `;
        const guitarCanvas = document.getElementById('ending-guitar');
        const ctx = guitarCanvas.getContext('2d');
        guitarCanvas.width = 100;
        guitarCanvas.height = 200;
        ctx.drawImage(guitarImage, 0, 0);
    };
}

// Event Listeners
document.getElementById('start-btn').addEventListener('click', initGame);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState.isPlaying) {
        gameState.player.vy = -10;
        audioSystem.playJump();
    }
});

document.addEventListener('touchstart', (e) => {
    if (gameState.isPlaying) {
        gameState.player.vy = -10;
        audioSystem.playJump();
        e.preventDefault();
    }
});

// Initialization
window.addEventListener('load', createStarfield);