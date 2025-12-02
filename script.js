// ====== CONFIG ======
const ROWS = 20;
const COLS = 30;

const gridContainer = document.getElementById("grid-container");
const startBtn = document.getElementById("start-search");
const clearBtn = document.getElementById("clear-grid");
const algoSelect = document.getElementById("algorithm-select");

let grid = [];
let startCell = null;
let endCell = null;
let mode = "wall"; // "wall" | "start" | "end"

// ====== INITIAL SETUP ======
function createGrid() {
  gridContainer.innerHTML = "";
  grid = [];

  for (let row = 0; row < ROWS; row++) {
    const rowArr = [];
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;

      cell.addEventListener("click", () => handleCellClick(cell));

      gridContainer.appendChild(cell);
      rowArr.push({
        row,
        col,
        isWall: false,
        element: cell,
      });
    }
    grid.push(rowArr);
  }

  // Default start & end
  startCell = grid[Math.floor(ROWS / 2)][Math.floor(COLS / 4)];
  endCell = grid[Math.floor(ROWS / 2)][Math.floor((3 * COLS) / 4)];
  startCell.element.classList.add("start");
  endCell.element.classList.add("end");
}

function handleCellClick(cellElem) {
  const row = parseInt(cellElem.dataset.row, 10);
  const col = parseInt(cellElem.dataset.col, 10);
  const cell = grid[row][col];

  if (mode === "wall") {
    // toggle wall
    cell.isWall = !cell.isWall;
    cell.element.classList.toggle("wall", cell.isWall);
  } else if (mode === "start") {
    if (startCell) {
      startCell.element.classList.remove("start");
    }
    startCell = cell;
    cell.element.classList.remove("wall");
    cell.isWall = false;
    cell.element.classList.add("start");
  } else if (mode === "end") {
    if (endCell) {
      endCell.element.classList.remove("end");
    }
    endCell = cell;
    cell.element.classList.remove("wall");
    cell.isWall = false;
    cell.element.classList.add("end");
  }
}

// Keyboard shortcuts for mode switching
document.addEventListener("keydown", (e) => {
  if (e.key === "s" || e.key === "S") mode = "start";
  if (e.key === "e" || e.key === "E") mode = "end";
  if (e.key === "w" || e.key === "W") mode = "wall";
});

// ====== CLEAR FUNCTION ======
function clearGrid(keepWalls = false) {
  for (let row of grid) {
    for (let cell of row) {
      cell.element.classList.remove("visited", "path");
      if (!keepWalls) {
        cell.isWall = false;
        cell.element.classList.remove("wall");
      }
    }
  }
}

// ====== BFS PATHFINDING ======
function getNeighbors(cell) {
  const dirs = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];
  const neighbors = [];

  for (let [dr, dc] of dirs) {
    const nr = cell.row + dr;
    const nc = cell.col + dc;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
      const neighbor = grid[nr][nc];
      if (!neighbor.isWall) {
        neighbors.push(neighbor);
      }
    }
  }
  return neighbors;
}

async function bfsAnimate() {
  if (!startCell || !endCell) return;

  clearGrid(true);

  const queue = [];
  const visited = new Set();
  const parent = new Map(); // to reconstruct path

  const startKey = `${startCell.row},${startCell.col}`;
  queue.push(startCell);
  visited.add(startKey);

  while (queue.length > 0) {
    const current = queue.shift();

    // Stop if we found the end
    if (current === endCell) {
      await visualizePath(parent, current);
      return;
    }

    // Skip coloring start/end
    if (current !== startCell && current !== endCell) {
      current.element.classList.add("visited");
      await sleep(15); // small delay for visualization
    }

    for (const neighbor of getNeighbors(current)) {
      const key = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(key)) {
        visited.add(key);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  alert("No path found!");
}

async function visualizePath(parent, endNode) {
  let current = endNode;
  const path = [];
  while (current && current !== startCell) {
    path.push(current);
    current = parent.get(current);
  }

  for (let cell of path.reverse()) {
    if (cell !== startCell && cell !== endCell) {
      cell.element.classList.remove("visited");
      cell.element.classList.add("path");
      await sleep(30);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ====== BUTTON EVENTS ======
startBtn.addEventListener("click", () => {
  const algo = algoSelect.value;
  if (algo === "bfs") {
    bfsAnimate();
  }
});

clearBtn.addEventListener("click", () => {
  clearGrid(false);
});

// Init
createGrid();
