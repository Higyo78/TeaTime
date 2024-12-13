
let board, context;
let boardWidth = 750;
let boardHeight = 250;

let dinoWidth = 88;
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;
let velocityX = -8;
let velocityY = 0;
let gravity = 0.4;

let gameInterval, spawnInterval;
let gameOver = false;
let score = 0;

let dinoImg = new Image();
dinoImg.src = "/img/dino.png";

let gameObjects = [];

let images = {
    bush: new Image(),
    teacup: new Image(),
    guard: new Image(),
};
images.bush.src = "/img/bush.png";
images.teacup.src = "/img/cup-of-tea.png";
images.guard.src = "/img/theguard.png";


class GameObject {
    constructor(img, x, y, width, height) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(context) {
        context.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += velocityX;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

let doubleJumpActive = false;

class Dino extends GameObject {
    constructor(img, x, y, width, height) {
        super(img, x, y, width, height);
        this.isJumping = false;
    }

    jump() {
        if (this.y === dinoY) {
            velocityY = -11;
        }

        if (doubleJumpActive && this.y === dinoY) {
            velocityY = -15;
            doubleJumpActive = false;
        }
    }

    activateDoubleJump() {
        doubleJumpActive = true;
    }

    update() {
        velocityY += gravity;
        this.y = Math.min(this.y + velocityY, dinoY);
    }
}


let dino = new Dino(dinoImg, dinoX, dinoY, dinoWidth, dinoHeight);


class Bush extends GameObject {}
class Teacup extends GameObject {}
class Dragon extends GameObject {}
class Guard extends GameObject {}


function spawnGameObject() {
    let randomChance = Math.random();

    if (randomChance > 0.75) {
        gameObjects.push(new Bush(images.bush, boardWidth, dinoY + 40, 52, 58));
    } else if (randomChance > 0.5) {
        gameObjects.push(new Teacup(images.teacup, boardWidth, dinoY + 40, 40, 40));
    } else {
        gameObjects.push(new Guard(images.guard, boardWidth, dinoY, 78, 90));
    }
}


function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}


function update() {
    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);


    dino.update();
    dino.draw(context);

 
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        let obj = gameObjects[i];
        obj.update();
        obj.draw(context);

        if (detectCollision(dino, obj)) {
            if (obj instanceof Teacup) {
                dino.activateDoubleJump();
            }

            if (obj instanceof Bush || obj instanceof Dragon || obj instanceof Guard) {
                gameOver = true;
                dino.img.src = "/img/dino-dead.png";
                endGame();
            }
        }

        if (obj.isOffScreen()) {
            gameObjects.splice(i, 1);
        }
    }

    context.fillStyle = "black";
    context.font = "20px courier";
    score++;
    context.fillText(score, 10, 20);
}

document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
        dino.jump();
    }
});

window.onload = () => {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    document.getElementById("startButton").addEventListener("click", function() {
        startGame();
    });
};

function startGame() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "none";
    document.querySelector(".game").style.display = "block";
    gameOver = false;
    score = 0;
    gameObjects = [];
    dino.y = dinoY;
    dino.img.src = "/img/dino.png";

    if (!gameInterval) {
        gameInterval = setInterval(() => requestAnimationFrame(update), 1000 / 60);
    }

    if (!spawnInterval) {
        spawnInterval = setInterval(spawnGameObject, 2000);
    }
}

let roundCount = 0;

function addScoreToTable(score) {
    roundCount++;
    let table = document.getElementById("scoreTable").getElementsByTagName("tbody")[0];
    let newRow = table.insertRow();
    newRow.insertCell(0).innerText = roundCount;
    newRow.insertCell(1).innerText = score;
}

function endGame() {
    clearInterval(spawnInterval);
    spawnInterval = null;

    document.getElementById("finalScore").textContent = score;

    addScoreToTable(score);

    showGameOverScreen();
}

function showGameOverScreen() {
    const gameOverScreen = document.getElementById("gameOverScreen");
    gameOverScreen.style.display = "block";
    document.querySelector(".game").style.display = "none";

    const restartButton = document.getElementById("restartButton");
    restartButton.addEventListener("click", restartGame);
}

function restartGame() {
    gameOver = false;
    score = 0;
    gameObjects = [];
    dino.y = dinoY;
    dino.img.src = "/img/dino.png";
    context.clearRect(0, 0, board.width, board.height);
    document.getElementById("gameOverScreen").style.display = "none";
    document.querySelector(".game").style.display = "block";

    if (!spawnInterval) {
        spawnInterval = setInterval(spawnGameObject, 2000);
    }
}
