const boardSize = 10;
const totalBombs = 10;
let timer = 0;
let timerInterval = null;
let bombsLeft = totalBombs;
let board = [];
let firstClick = true;
let opened = 0;
let gameEnded = false;

const numberColors = {
  1: 'blue',
  2: 'green',
  3: 'red',
  4: 'purple',
  5: 'maroon',
  6: 'teal',
  7: 'brown',
  8: 'gray'
};

function posToIndex(x, y) {
  return y * boardSize + x;
}

function indexToPos(i) {
  return { x: i % boardSize, y: Math.floor(i / boardSize) };
}

function inBounds(x, y) {
  return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (timer >= 999) {
      document.getElementById('timer').textContent = '999';
      clearInterval(timerInterval);
      return;
    }
    timer += 1;
    document.getElementById('timer').textContent = String(timer).padStart(3, '0');
  }, 1000);
}

function placeBombs(exclude) {
  const spots = [];
  for (let i = 0; i < boardSize * boardSize; i += 1) {
    if (i !== exclude) spots.push(i);
  }
  for (let i = 0; i < totalBombs; i += 1) {
    const idx = Math.floor(Math.random() * spots.length);
    const pos = spots.splice(idx, 1)[0];
    board[pos].bomb = true;
  }
}

function calcNumbers() {
  for (let i = 0; i < board.length; i += 1) {
    if (board[i].bomb) continue;
    const { x, y } = indexToPos(i);
    let count = 0;
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (inBounds(nx, ny) && board[posToIndex(nx, ny)].bomb) count += 1;
      }
    }
    board[i].number = count;
  }
}

function showMessage(msg) {
  document.getElementById('message').textContent = msg;
}

function gameOver(win) {
  clearInterval(timerInterval);
  timerInterval = null;
  gameEnded = true;
  showMessage(win ? 'COMPLETE' : 'FAILURE');
  board.forEach(c => {
    if (c.bomb) c.element.textContent = '💣';
  });
}

function checkWin() {
  if (opened === boardSize * boardSize - totalBombs) {
    gameOver(true);
  }
}

function openCell(index) {
  const cell = board[index];
  if (cell.open || cell.flag) return;
  cell.open = true;
  cell.element.classList.add('open');
  opened += 1;
  if (cell.bomb) {
    cell.element.textContent = '💣';
    gameOver(false);
    return;
  }
  if (cell.number > 0) {
    cell.element.textContent = cell.number;
    cell.element.style.color = numberColors[cell.number];
  } else {
    const { x, y } = indexToPos(index);
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (inBounds(nx, ny)) openCell(posToIndex(nx, ny));
      }
    }
  }
  checkWin();
}

function onLeftClick(e) {
  if (gameEnded) return;
  const idx = Number(e.currentTarget.dataset.index);
  if (firstClick) {
    placeBombs(idx);
    calcNumbers();
    startTimer();
    firstClick = false;
  }
  openCell(idx);
}

function placeFlag(cell) {
  if (cell.open) return;
  if (!cell.flag) {
    cell.flag = true;
    cell.element.classList.add('flag');
    bombsLeft = Math.max(0, bombsLeft - 1);
  } else {
    cell.flag = false;
    cell.element.classList.remove('flag');
    bombsLeft = Math.min(totalBombs, bombsLeft + 1);
  }
  document.getElementById('bomb-counter').textContent = bombsLeft;
}

function onRightClick(e) {
  e.preventDefault();
  if (gameEnded) return;
  const idx = Number(e.currentTarget.dataset.index);
  placeFlag(board[idx]);
}

function initBoard() {
  const boardElem = document.getElementById('board');
  boardElem.innerHTML = '';
  boardElem.style.gridTemplateColumns = `repeat(${boardSize}, 25px)`;
  board = [];
  for (let i = 0; i < boardSize * boardSize; i += 1) {
    const cellElem = document.createElement('div');
    cellElem.className = 'cell';
    cellElem.dataset.index = i;
    cellElem.addEventListener('click', onLeftClick);
    cellElem.addEventListener('contextmenu', onRightClick);
    boardElem.appendChild(cellElem);
    board.push({ bomb: false, open: false, flag: false, number: 0, element: cellElem });
  }
}

function resetGame() {
  clearInterval(timerInterval);
  timerInterval = null;
  timer = 0;
  bombsLeft = totalBombs;
  firstClick = true;
  opened = 0;
  gameEnded = false;
  document.getElementById('timer').textContent = '000';
  document.getElementById('bomb-counter').textContent = bombsLeft;
  showMessage('');
  initBoard();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reset').addEventListener('click', resetGame);
  document.getElementById('bomb-counter').textContent = bombsLeft;
  initBoard();
});
