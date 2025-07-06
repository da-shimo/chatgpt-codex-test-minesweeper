// 現在の盤面設定
let boardWidth = 9;
let boardHeight = 9;
let totalBombs = 10;
// タイマーの状態
let timer = 0;
let timerInterval = null;
// 残り爆弾数のカウンター
let bombsLeft = totalBombs;
// セルのデータ配列
let board = [];
// ゲーム状態を管理するフラグ
let firstClick = true;
let opened = 0;
let gameEnded = false;

// 頻繁にアクセスするDOM要素
const boardElem = document.getElementById('board');
const timerElem = document.getElementById('timer');
const bombCounterElem = document.getElementById('bomb-counter');
const messageElem = document.getElementById('message');
const levelButtons = document.querySelectorAll('.level-select button');
const resetBtn = document.getElementById('reset');

// 難易度設定
const levels = {
  beginner: { w: 9, h: 9, bombs: 10 },
  intermediate: { w: 16, h: 16, bombs: 40 },
  advanced: { w: 30, h: 16, bombs: 99 }
};

// 数字ごとの色設定
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

// 座標を配列のインデックスに変換
const posToIndex = (x, y) => y * boardWidth + x;

// インデックスを座標に変換
const indexToPos = i => ({ x: i % boardWidth, y: Math.floor(i / boardWidth) });

// 座標が盤面内か判定
const inBounds = (x, y) => x >= 0 && x < boardWidth && y >= 0 && y < boardHeight;

// 初回クリック後にタイマー開始
function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (timer >= 999) {
      timerElem.textContent = '999';
      clearInterval(timerInterval);
      return;
    }
    timer += 1;
    timerElem.textContent = String(timer).padStart(3, '0');
  }, 1000);
}

// 最初に開いたマス以外にランダムで爆弾配置
function placeBombs(exclude) {
  const spots = [];
  for (let i = 0; i < boardWidth * boardHeight; i += 1) {
    if (i !== exclude) spots.push(i);
  }
  for (let i = 0; i < totalBombs; i += 1) {
    const idx = Math.floor(Math.random() * spots.length);
    const pos = spots.splice(idx, 1)[0];
    board[pos].bomb = true;
  }
}

// 各セルの周囲の爆弾数を計算
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

// 盤面下にメッセージを表示
const showMessage = msg => {
  messageElem.textContent = msg;
};

// すべての爆弾を表示してタイマー停止
function gameOver(win, exploded) {
  clearInterval(timerInterval);
  timerInterval = null;
  gameEnded = true;
  showMessage(win ? 'COMPLETE' : 'FAILURE');
  board.forEach((c, i) => {
    if (c.bomb) {
      c.element.textContent = i === exploded ? '💥' : '💣';
    }
  });
}

// 爆弾以外をすべて開くと勝利
function checkWin() {
  if (opened === boardWidth * boardHeight - totalBombs) {
    gameOver(true);
  }
}

// セルを開き、周囲に爆弾がなければ連鎖的に開く
function openCell(index) {
  const cell = board[index];
  if (cell.open || cell.flag) return;
  cell.open = true;
  cell.element.classList.add('open');
  opened += 1;
  if (cell.bomb) {
    gameOver(false, index);
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

// 左クリックでセルを開く
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

// セルにフラグを付け外しする
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
  bombCounterElem.textContent = bombsLeft;
}

// 右クリックでフラグを切り替え
function onRightClick(e) {
  e.preventDefault();
  if (gameEnded) return;
  const idx = Number(e.currentTarget.dataset.index);
  placeFlag(board[idx]);
}

// ボードのDOM要素を生成
function initBoard() {
  boardElem.innerHTML = '';
  boardElem.style.gridTemplateColumns = `repeat(${boardWidth}, 25px)`;
  boardElem.style.gridTemplateRows = `repeat(${boardHeight}, 25px)`;
  board = Array.from({ length: boardWidth * boardHeight }, (_, i) => {
    const cellElem = document.createElement('div');
    cellElem.className = 'cell';
    cellElem.dataset.index = i;
    cellElem.addEventListener('click', onLeftClick);
    cellElem.addEventListener('contextmenu', onRightClick);
    boardElem.appendChild(cellElem);
    return { bomb: false, open: false, flag: false, number: 0, element: cellElem };
  });
}

// 他の難易度に切り替え
function changeLevel(level) {
  const cfg = levels[level];
  if (!cfg) return;
  boardWidth = cfg.w;
  boardHeight = cfg.h;
  totalBombs = cfg.bombs;
  resetGame();
}

// 初期状態に戻して盤面を再描画
function resetGame() {
  clearInterval(timerInterval);
  timerInterval = null;
  timer = 0;
  bombsLeft = totalBombs;
  firstClick = true;
  opened = 0;
  gameEnded = false;
  timerElem.textContent = '000';
  bombCounterElem.textContent = bombsLeft;
  showMessage('');
  initBoard();
}

// ページ読み込み時にイベントを設定
document.addEventListener('DOMContentLoaded', () => {
  resetBtn.addEventListener('click', resetGame);
  bombCounterElem.textContent = bombsLeft;
  levelButtons.forEach(btn => {
    btn.addEventListener('click', () => changeLevel(btn.dataset.level));
  });
  initBoard();
});
