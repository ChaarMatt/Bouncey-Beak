// Load the duck sprite
const duckImg = new Image();
duckImg.src = "Pixelated_Duck_Transparent.png";

// Load pixel-art pipe images
const pipeTopImg = new Image();
pipeTopImg.src = "pipe_top.png";

const pipeMiddleImg = new Image();
pipeMiddleImg.src = "pipe_middle.png";

const pipeBottomImg = new Image();
pipeBottomImg.src = "pipe_bottom.png";

/* ---------- JavaScript Game Code ---------- */

// Get the canvas and its 2D drawing context.
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ------------------ Global Game Variables ------------------
let score = 0;
let highScore = 0;
let gameOver = false;
let gameStarted = false;
let frameCount = 0;

// ------------------ Bird (Player) Object ------------------
const bird = {
  x: 50,
  y: canvas.height / 2,
  width: 30,
  height: 30,
  gravity: 0.6,
  lift: -10,
  velocity: 0
};

// ------------------ Pipe (Obstacle) Settings ------------------
const pipeWidth = 50;
const pipeGap = 100;
let pipes = [];

// ------------------ Ground (Scrolling Floor) Settings ------------------
const groundHeight = 80;
let groundX = 0;
const groundScrollSpeed = 2;

// ------------------ Input Handling ------------------
function jump() {
  bird.velocity = bird.lift;
}

document.addEventListener("keydown", function(e) {
  if (e.code === "Space") {
    e.preventDefault();
    if (!gameStarted) {
      gameStarted = true;
    }
    if (!gameOver) jump();
    else resetGame();
  }
});

canvas.addEventListener("touchstart", function(e) {
  e.preventDefault();
  if (!gameStarted) {
    gameStarted = true;
  }
  if (!gameOver) jump();
  else resetGame();
});

// ------------------ The Main Game Loop ------------------
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround();

  if (gameStarted) {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height - groundHeight) {
      bird.y = canvas.height - groundHeight - bird.height;
      gameOver = true;
    }

    if (bird.y < 0) {
      bird.y = 0;
      bird.velocity = 0;
    }

    if (frameCount % 90 === 0) {
      const topPipeHeight = Math.random() * (canvas.height - groundHeight - pipeGap - 50) + 20;
      pipes.push({
        x: canvas.width,
        top: topPipeHeight,
        bottom: canvas.height - groundHeight - (topPipeHeight + pipeGap),
        scored: false
      });
    }

    pipes.forEach(pipe => {
      pipe.x -= groundScrollSpeed;

      if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
        score++;
        pipe.scored = true;
      }

      if (pipe.x + pipeWidth < 0) {
        pipes = pipes.filter(p => p !== pipe);
      }

      if (checkCollision(bird, pipe)) {
        gameOver = true;
      }
    });

    frameCount++;
  }

  drawBird();
  drawPipes();
  updateScore();

  if (gameOver) {
    drawGameOver();
    if (score > highScore) {
      highScore = score;
    }
  } else if (!gameStarted) {
    drawStartPrompt();
  }

  requestAnimationFrame(update);
}

// ------------------ Drawing Functions ------------------
function drawGround() {
  groundX -= groundScrollSpeed;
  if (groundX <= -canvas.width) {
    groundX = 0;
  }
  ctx.fillStyle = "#ded895";
  ctx.fillRect(groundX, canvas.height - groundHeight, canvas.width, groundHeight);
  ctx.fillRect(groundX + canvas.width, canvas.height - groundHeight, canvas.width, groundHeight);
}

function drawBird() {
  if (duckImg.complete) {
    ctx.drawImage(duckImg, bird.x, bird.y, bird.width, bird.height);
  } else {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPipes() {
  pipes.forEach(pipe => {
    // Top pipe
    ctx.drawImage(pipeTopImg, pipe.x, 0, pipeWidth, pipeTopImg.height);

    // Middle section of the top pipe
    for (let y = pipeTopImg.height; y < pipe.top - pipeTopImg.height; y += pipeMiddleImg.height) {
      ctx.drawImage(pipeMiddleImg, pipe.x, y, pipeWidth, pipeMiddleImg.height);
    }

    // Bottom pipe
    ctx.drawImage(pipeBottomImg, pipe.x, canvas.height - groundHeight - pipe.bottom, pipeWidth, pipeBottomImg.height);

    // Middle section of the bottom pipe
    for (let y = canvas.height - groundHeight - pipe.bottom - pipeMiddleImg.height; y > pipe.top + pipeGap; y -= pipeMiddleImg.height) {
      ctx.drawImage(pipeMiddleImg, pipe.x, y, pipeWidth, pipeMiddleImg.height);
    }
  });
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "36px Arial";
  ctx.fillText("Game Over", 80, canvas.height / 2 - 20);
  ctx.font = "20px Arial";
  ctx.fillText("Press space or tap to restart", 40, canvas.height / 2 + 20);
}

function drawStartPrompt() {
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("Tap or press space to start", 20, canvas.height / 2);
}

function updateScore() {
  document.getElementById("overlay").innerText = `Score: ${score}\nHigh Score: ${highScore}`;
}

// ------------------ Collision Detection ------------------
function checkCollision(bird, pipe) {
  const birdBox = {
    x: bird.x,
    y: bird.y,
    width: bird.width,
    height: bird.height
  };

  const topPipeBox = {
    x: pipe.x,
    y: 0,
    width: pipeWidth,
    height: pipe.top
  };

  const bottomPipeBox = {
    x: pipe.x,
    y: canvas.height - groundHeight - pipe.bottom,
    width: pipeWidth,
    height: pipe.bottom
  };

  return rectIntersect(birdBox.x, birdBox.y, birdBox.width, birdBox.height,
                     topPipeBox.x, topPipeBox.y, topPipeBox.width, topPipeBox.height) ||
         rectIntersect(birdBox.x, birdBox.y, birdBox.width, birdBox.height,
                     bottomPipeBox.x, bottomPipeBox.y, bottomPipeBox.width, bottomPipeBox.height);
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return !(x2 > x1 + w1 ||
           x2 + w2 < x1 ||
           y2 > y1 + h1 ||
           y2 + h2 < y1);
}

// ------------------ Reset Function ------------------
function resetGame() {
  score = 0;
  gameOver = false;
  gameStarted = false;
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  frameCount = 0;
}


// ------------------ Start the Game Loop ------------------
update();
