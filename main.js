const boardSize = 8;
const totalBombs = 10;
let timer = 0;
let timerInterval = null;
let bombsLeft = totalBombs;

function startTimer() {
  timerInterval = setInterval(() => {
    if (timer >= 999) {
      document.getElementById('timer').textContent = '999';
      clearInterval(timerInterval);
      return;
    }
    timer += 1;
    if (timer > 999) timer = 999;
    document.getElementById('timer').textContent = String(timer).padStart(3, '0');
  }, 1000);
}

function placeFlag(cell) {
  if (!cell.classList.contains('flag')) {
    cell.classList.add('flag');
    bombsLeft = Math.max(0, bombsLeft - 1);
    document.getElementById('bomb-counter').textContent = bombsLeft;
  } else {
    cell.classList.remove('flag');
  }
}

function initBoard() {
  const board = document.getElementById('board');
  for (let i = 0; i < boardSize * boardSize; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      placeFlag(cell);
    });
    board.appendChild(cell);
  }
}

function resetGame() {
  clearInterval(timerInterval);
  timer = 0;
  document.getElementById('timer').textContent = '000';
  bombsLeft = totalBombs;
  document.getElementById('bomb-counter').textContent = bombsLeft;
  const board = document.getElementById('board');
  board.innerHTML = '';
  initBoard();
  startTimer();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reset').addEventListener('click', resetGame);
  document.getElementById('bomb-counter').textContent = bombsLeft;
  initBoard();
  startTimer();
});
