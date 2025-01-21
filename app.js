const grid = document.querySelector(".grid");
const resultDisplay = document.querySelector(".results");
const width = 15;
let currentShooterIndex = 202;
let alienInvaders = [];
let aliensRemoved = [];
let invadersId;
let boss = null;
let level = 1;
let score = 0;
let invaderSpeed = 600;

// Create grid
for (let i = 0; i < width * width; i++) {
    const square = document.createElement("div");
    grid.appendChild(square);
}
const squares = Array.from(document.querySelectorAll(".grid div"));

// Shooter
squares[currentShooterIndex].classList.add("shooter");

// Generate aliens
function generateAliens() {
    alienInvaders = [];
    const rows = 3 + level; // Increase rows with level
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < 10; j++) {
            alienInvaders.push(i * width + j);
        }
    }
    aliensRemoved = [];
    drawAliens();
}

// Draw aliens
function drawAliens() {
    alienInvaders.forEach((invader, index) => {
        if (!aliensRemoved.includes(index)) {
            squares[invader].classList.add("invader");
        }
    });
}

// Remove aliens
function removeAliens() {
    alienInvaders.forEach((invader) => squares[invader].classList.remove("invader"));
}

// Move shooter
function moveShooter(e) {
    squares[currentShooterIndex].classList.remove("shooter");
    if (e.key === "ArrowLeft" && currentShooterIndex % width !== 0) {
        currentShooterIndex -= 1;
    } else if (e.key === "ArrowRight" && currentShooterIndex % width < width - 1) {
        currentShooterIndex += 1;
    }
    squares[currentShooterIndex].classList.add("shooter");
}
document.addEventListener("keydown", moveShooter);

// Move aliens
function moveAliens() {
    const leftEdge = alienInvaders[0] % width === 0;
    const rightEdge = alienInvaders[alienInvaders.length - 1] % width === width - 1;
    removeAliens();

    if (rightEdge) {
        alienInvaders = alienInvaders.map((invader) => invader + width + 1);
    } else if (leftEdge) {
        alienInvaders = alienInvaders.map((invader) => invader + width - 1);
    } else {
        alienInvaders = alienInvaders.map((invader) => invader + (leftEdge ? -1 : 1));
    }

    drawAliens();

    // Game over logic
    if (alienInvaders.some((invader) => invader >= currentShooterIndex)) {
        resultDisplay.innerHTML = "Game Over";
        clearInterval(invadersId);
    }

    // Check win condition
    if (aliensRemoved.length === alienInvaders.length) {
        clearInterval(invadersId);
        spawnBoss();
    }
}

// Shoot laser
function shoot(e) {
    if (e.key !== "ArrowUp") return;
    let laserIndex = currentShooterIndex;
    const laserId = setInterval(() => {
        squares[laserIndex].classList.remove("laser");
        laserIndex -= width;
        if (laserIndex < 0) {
            clearInterval(laserId);
            return;
        }
        squares[laserIndex].classList.add("laser");

        // Hit invader
        if (squares[laserIndex].classList.contains("invader")) {
            squares[laserIndex].classList.remove("laser", "invader");
            squares[laserIndex].classList.add("boom");
            setTimeout(() => squares[laserIndex].classList.remove("boom"), 300);
            clearInterval(laserId);
            const index = alienInvaders.indexOf(laserIndex);
            aliensRemoved.push(index);
            score++;
            resultDisplay.innerHTML = `Level: ${level} | Score: ${score}`;
        }

        // Hit boss
        if (squares[laserIndex].classList.contains("boss")) {
            boss.health--;
            squares[laserIndex].classList.remove("laser");
            if (boss.health <= 0) {
                squares[boss.position].classList.remove("boss");
                boss = null;
                nextLevel();
            }
        }
    }, 100);
}
document.addEventListener("keydown", shoot);

// Spawn boss
function spawnBoss() {
    boss = { position: Math.floor(width / 2), health: level * 5 };
    squares[boss.position].classList.add("boss");
}

// Next level
function nextLevel() {
    level++;
    invaderSpeed = Math.max(300, invaderSpeed - 50); // Increase speed
    resultDisplay.innerHTML = `Level: ${level} | Score: ${score}`;
    generateAliens();
    invadersId = setInterval(moveAliens, invaderSpeed);
}

// Start game
generateAliens();
invadersId = setInterval(moveAliens, invaderSpeed);
