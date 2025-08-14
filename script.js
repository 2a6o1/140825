// Stats
let hunger = 50;
let happiness = 50;
let energy = 50;

// HTML elements
const hungerEl = document.getElementById("hunger");
const happinessEl = document.getElementById("happiness");
const energyEl = document.getElementById("energy");

// Canvas setup
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 32;
const PIXEL_SIZE = 10;
let CHAR_SIZE = 4;

// Character current position (floating for smooth movement)
let charX = 0;
let charY = 0;

// Target position
let targetX = 0;
let targetY = 0;

// Animation speed (cells per frame)
const speed = 0.2;

// Custom character pixels (default 4x4 green block)

// Default character (standing)
let charPixels = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 1, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 0, 1],
  [0, 1, 0, 0, 0, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
];

// Eating pose (charPixelsEat)
const charPixelsEat = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 0, 1, 1],
  [1, 0, 1, 1, 1, 1, 0, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
];

// Sleeping pose (charPixelsSleep)
const charPixelsSleep = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 0, 1],
  [0, 1, 0, 0, 0, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
];

CHAR_SIZE = charPixels.length;

let showMessage = false;

let messageX = canvas.width;
let messageY = canvas.height / 2 - 20;
let messageSpeed = 2;

// Draw the screen and character
function drawScreen() {
  ctx.fillStyle = "#222"; // fondo
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mensaje en movimiento
  if (showMessage) {
    drawPixelText("FELIZ CUMPLEAÑOS", messageX, messageY, 8, "#ff77b7");
    messageX -= messageSpeed; // mueve hacia la izquierda

    // Si salió completamente, reinicia a la derecha
    if (messageX < -textWidth("FELIZ CUMPLEAÑOS", 8)) {
      messageX = canvas.width;
    }
  }

  // Personaje
  ctx.fillStyle = drawCharacterColor;
  for (let y = 0; y < charPixels.length; y++) {
    for (let x = 0; x < charPixels[y].length; x++) {
      if (charPixels[y][x]) {
        ctx.fillRect(
          charX * PIXEL_SIZE + x * PIXEL_SIZE,
          charY * PIXEL_SIZE + y * PIXEL_SIZE,
          PIXEL_SIZE,
          PIXEL_SIZE
        );
      }
    }
  }
}

// Función para obtener el ancho del texto en píxeles
function textWidth(text, pixelSize) {
  let width = 0;
  for (let char of text) {
    let letter = LETTERS[char.toUpperCase()];
    if (!letter) continue;
    width += (letter[0].length + 1) * pixelSize;
  }
  return width;
}

// Animate movement towards target
function animate() {
  if (!tetrisMode) {
    let dx = targetX - charX;
    let dy = targetY - charY;
    if (Math.abs(dx) > 0.01) charX += dx * speed;
    if (Math.abs(dy) > 0.01) charY += dy * speed;
    drawScreen();
  }
  requestAnimationFrame(animate);
}

// Move character to a new random position
function moveCharacter() {
  targetX = Math.floor(Math.random() * (GRID_SIZE - charPixels[0].length + 1));
  targetY = Math.floor(Math.random() * (GRID_SIZE - charPixels.length + 1));
}

// Stats buttons
// Crear menú de comida dinámico
const foodMenu = document.createElement("div");
foodMenu.style.display = "none";
document.body.appendChild(foodMenu);

const foods = ["🍎 Apple", "🍕 Pizza", "🥦 Broccoli"]; // Opciones
let poisonedFood = null;

// Mostrar menú de comida cuando pulsamos Feed
document.getElementById("feedBtn").addEventListener("click", () => {
  foodMenu.innerHTML = "";
  foodMenu.style.display = "block";

  // Decide si habrá comida envenenada (75% de probabilidad)
  if (Math.random() < 0.75) {
    poisonedFood = Math.floor(Math.random() * foods.length);
  } else {
    poisonedFood = null;
  }

  foods.forEach((food, index) => {
    const btn = document.createElement("button");
    btn.textContent = food;
    btn.style.margin = "5px";
    btn.addEventListener("click", () => eatFood(index));
    foodMenu.appendChild(btn);
  });
});

function eatFood(index) {
  foodMenu.style.display = "none";
  const previous = charPixels;
  charPixels = charPixelsEat;

  if (index === poisonedFood) {
    console.log("⚠️ Oh no! Poisoned food!");
    drawCharacterColor = "#a0f"; // púrpura permanente
    hunger = Math.min(100, hunger + 20);
  } else {
    console.log("✅ Good food!");
    drawCharacterColor = "#0f0"; // verde
    hunger = Math.max(0, hunger - 10);
    happiness = Math.min(100, happiness + 5);
  }

  updateStats();

  setTimeout(() => {
    charPixels = previous; // vuelve a la pose original
    // 👀 aquí no tocamos el color
  }, 2000);
}

// Añadimos una variable para el color del personaje
let drawCharacterColor = "#0f0";

// Modificamos drawScreen() para usar el color dinámico
function drawScreen() {
  ctx.fillStyle = "#222"; // fondo
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (showMessage) {
    drawPixelText("FELIZ CUMPLEAÑOS", 20, canvas.height / 2 - 20, 8, "#ff77b7");
  }

  ctx.fillStyle = drawCharacterColor; // personaje
  for (let y = 0; y < charPixels.length; y++) {
    for (let x = 0; x < charPixels[y].length; x++) {
      if (charPixels[y][x]) {
        ctx.fillRect(
          charX * PIXEL_SIZE + x * PIXEL_SIZE,
          charY * PIXEL_SIZE + y * PIXEL_SIZE,
          PIXEL_SIZE,
          PIXEL_SIZE
        );
      }
    }
  }
}

document.getElementById("playBtn").addEventListener("click", () => {
  happiness = Math.min(100, happiness + 10);
  energy = Math.max(0, energy - 5);
  updateStats();
});

document.getElementById("restBtn").addEventListener("click", () => {
  energy = Math.min(100, energy + 15);
  updateStats();
  const previous = charPixels;
  charPixels = charPixelsSleep; 
  setTimeout(() => {
    charPixels = previous;
  }, 2000); 
});

function updateStats() {
  hungerEl.textContent = hunger;
  happinessEl.textContent = happiness;
  energyEl.textContent = energy;
}

// Decrease stats over time
setInterval(() => {
  hunger = Math.min(100, hunger + 5);
  happiness = Math.max(0, happiness - 3);
  energy = Math.max(0, energy - 2);
  updateStats();
}, 5000);

// Custom Character Editor
const charEditor = document.getElementById("charEditor");
const charCtx = charEditor.getContext("2d");
const EDITOR_SIZE = 12;
const EDITOR_PIXEL = 10;
let editingPixels = Array.from({ length: EDITOR_SIZE }, () =>
  Array(EDITOR_SIZE).fill(false)
);

document.getElementById("drawCharBtn").addEventListener("click", () => {
  charEditor.style.display = "block";
  document.getElementById("saveCharBtn").style.display = "inline";

  // Load current character into editor
// Load current character into editor
for (let y = 0; y < EDITOR_SIZE; y++) {
  for (let x = 0; x < EDITOR_SIZE; x++) {
    // Calculate offset to center charPixels in 12x12
    const offsetY = Math.floor((EDITOR_SIZE - charPixels.length) / 2);
    const offsetX = Math.floor((EDITOR_SIZE - charPixels[0].length) / 2);

    // Only copy if inside charPixels bounds
    if (
      y - offsetY >= 0 &&
      y - offsetY < charPixels.length &&
      x - offsetX >= 0 &&
      x - offsetX < charPixels[0].length
    ) {
      editingPixels[y][x] = charPixels[y - offsetY][x - offsetX] ? true : false;
    } else {
      editingPixels[y][x] = false; // empty
    }
  }
}


  drawEditor();
});

document.getElementById("saveCharBtn").addEventListener("click", () => {
  // Copy the editor grid
  let temp = editingPixels.map((row) => row.slice());

  // Trim empty top and bottom
  while (temp.length && temp[0].every((cell) => !cell)) temp.shift();
  while (temp.length && temp[temp.length - 1].every((cell) => !cell))
    temp.pop();

  // Trim empty left and right
  let left = 0;
  let right = temp[0].length - 1;
  while (left <= right && temp.every((row) => !row[left])) left++;
  while (right >= left && temp.every((row) => !row[right])) right--;

  // Slice columns
  temp = temp.map((row) => row.slice(left, right + 1));

  charPixels = temp;
  CHAR_SIZE = charPixels.length;

  // Log the array of 0s and 1s
  const arrayForLog = charPixels.map((row) =>
    row.map((cell) => (cell ? 1 : 0))
  );
  console.log(arrayForLog.map((row) => JSON.stringify(row)).join(",\n"));

  charEditor.style.display = "none";
  document.getElementById("saveCharBtn").style.display = "none";
});

charEditor.addEventListener("click", (e) => {
  const rect = charEditor.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / EDITOR_PIXEL);
  const y = Math.floor((e.clientY - rect.top) / EDITOR_PIXEL);
  if (x >= 0 && x < EDITOR_SIZE && y >= 0 && y < EDITOR_SIZE) {
    editingPixels[y][x] = !editingPixels[y][x]; // toggle pixel
    drawEditor();
  }
});

function drawEditor() {
  // Make sure canvas is cleared
  charCtx.fillStyle = "#222";
  charCtx.fillRect(0, 0, EDITOR_SIZE * EDITOR_PIXEL, EDITOR_SIZE * EDITOR_PIXEL);

  for (let y = 0; y < EDITOR_SIZE; y++) {
    for (let x = 0; x < EDITOR_SIZE; x++) {
      // Fill pixel
      charCtx.fillStyle = editingPixels[y][x] ? "#0f0" : "#444";
      charCtx.fillRect(
        x * EDITOR_PIXEL,
        y * EDITOR_PIXEL,
        EDITOR_PIXEL,
        EDITOR_PIXEL
      );

      // Stroke **inside pixel** to avoid half-pixel shift
      charCtx.strokeStyle = "#555";
      charCtx.lineWidth = 1;
      charCtx.strokeRect(
        x * EDITOR_PIXEL + 0.5,
        y * EDITOR_PIXEL + 0.5,
        EDITOR_PIXEL - 1,
        EDITOR_PIXEL - 1
      );
    }
  }
}


// --- Tetris Setup ---
let tetrisMode = false;
const TETRIS_COLS = 10;
const TETRIS_ROWS = 20;
let tetrisGrid = Array.from({ length: TETRIS_ROWS }, () =>
  Array(TETRIS_COLS).fill(0)
);

const tetrominoes = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T
  [
    [1, 0, 0],
    [1, 1, 1],
  ], // J
  [
    [0, 0, 1],
    [1, 1, 1],
  ], // L
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // S
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // Z
];

let currentPiece = null;
let pieceX = 0;
let pieceY = 0;
let dropCounter = 0;

// Pick a new random piece
function newPiece() {
  currentPiece = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
  pieceX = Math.floor((TETRIS_COLS - currentPiece[0].length) / 2);
  pieceY = 0;
}

// Draw Tetris
function drawTetris() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw placed grid
  for (let y = 0; y < TETRIS_ROWS; y++) {
    for (let x = 0; x < TETRIS_COLS; x++) {
      if (tetrisGrid[y][x]) {
        ctx.fillStyle = "#0f0";
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    }
  }

  // Draw current piece
  if (currentPiece) {
    ctx.fillStyle = "#0ff";
    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[y].length; x++) {
        if (currentPiece[y][x]) {
          ctx.fillRect(
            (pieceX + x) * PIXEL_SIZE,
            (pieceY + y) * PIXEL_SIZE,
            PIXEL_SIZE,
            PIXEL_SIZE
          );
        }
      }
    }
  }
}

// Drop piece down
function tetrisStep() {
  if (!tetrisMode) return;

  dropCounter++;
  if (dropCounter > 20) {
    // speed
    pieceY++;
    if (collides()) {
      pieceY--;
      mergePiece();
      newPiece();
    }
    dropCounter = 0;
  }
  drawTetris();
  requestAnimationFrame(tetrisStep);
}

// Check collision
function collides() {
  for (let y = 0; y < currentPiece.length; y++) {
    for (let x = 0; x < currentPiece[y].length; x++) {
      if (currentPiece[y][x]) {
        let nx = pieceX + x;
        let ny = pieceY + y;
        if (
          ny >= TETRIS_ROWS ||
          nx < 0 ||
          nx >= TETRIS_COLS ||
          (ny >= 0 && tetrisGrid[ny][nx])
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// Merge piece into grid
function mergePiece() {
  for (let y = 0; y < currentPiece.length; y++) {
    for (let x = 0; x < currentPiece[y].length; x++) {
      if (currentPiece[y][x]) {
        tetrisGrid[pieceY + y][pieceX + x] = 1;
      }
    }
  }
}

// Rotate piece
function rotate() {
  const rotated = currentPiece[0].map((_, i) =>
    currentPiece.map((r) => r[i]).reverse()
  );
  currentPiece = rotated;
  if (collides()) {
    // undo if collides
    currentPiece = rotated[0].map((_, i) => rotated.map((r) => r[i])).reverse();
  }
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (!tetrisMode) return;
  if (e.key === "ArrowLeft") {
    pieceX--;
    if (collides()) pieceX++;
  }
  if (e.key === "ArrowRight") {
    pieceX++;
    if (collides()) pieceX--;
  }
  if (e.key === "ArrowDown") {
    pieceY++;
    if (collides()) {
      pieceY--;
      mergePiece();
      newPiece();
    }
  }
  if (e.key === "ArrowUp") rotate();
});

// --- Modify Play button ---
document.getElementById("playBtn").addEventListener("click", () => {
  happiness = Math.min(100, happiness + 10);
  energy = Math.max(0, energy - 5);
  updateStats();

  // Switch to Tetris mode
  tetrisMode = true;
  tetrisGrid = Array.from({ length: TETRIS_ROWS }, () =>
    Array(TETRIS_COLS).fill(0)
  );
  newPiece();
  tetrisStep();

  // After 10 seconds return to pet mode
  setTimeout(() => {
    tetrisMode = false;
  }, 10000);
});

// --- Update animate() ---
function animate() {
  if (!tetrisMode) {
    let dx = targetX - charX;
    let dy = targetY - charY;
    if (Math.abs(dx) > 0.01) charX += dx * speed;
    if (Math.abs(dy) > 0.01) charY += dy * speed;
    drawScreen();
  }
  requestAnimationFrame(animate);
}

// Start animation
animate();
setInterval(moveCharacter, 3000);
drawScreen();
updateStats();

const LETTERS = {
  F: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  E: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  L: [
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  I: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  Z: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  A: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  P: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  C: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1],
  ],
  U: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  M: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  B: [
    [1, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 0, 0],
  ],
  Y: [
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  O: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  R: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0],
  ],
  " ": [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
};

function drawPixelText(text, startX, startY, pixelSize = 8, color = "#0ff") {
  let x = startX;
  for (let char of text) {
    let letter = LETTERS[char.toUpperCase()];
    if (!letter) continue;
    for (let row = 0; row < letter.length; row++) {
      for (let col = 0; col < letter[row].length; col++) {
        if (letter[row][col]) {
          ctx.fillStyle = color;
          ctx.fillRect(
            x + col * pixelSize,
            startY + row * pixelSize,
            pixelSize,
            pixelSize
          );
        }
      }
    }
    x += (letter[0].length + 1) * pixelSize; // espacio entre letras
  }
}

document.getElementById("startBtn").addEventListener("click", () => {
  document.getElementById("popupOverlay").style.display = "none";
  document.getElementById("gameContainer").style.display = "block";

  // Mostrar mensaje
  showMessage = true;
  drawScreen(); // dibuja fondo + personaje
  drawPixelText("FELIZ CUMPLEAÑOS", 20, canvas.height / 2 - 20, 8, "#ff77b7");

  // Después de 3s quitamos el mensaje
  setTimeout(() => {
    showMessage = false;
  }, 3000);
});
