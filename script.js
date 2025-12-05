/* Dual-mode Tic-Tac-Toe: 2 Players (Local) OR 1 Player (You vs AI) */

const boardEl = document.getElementById('board');
const statusTurn = document.getElementById('turn');
const resetBtn = document.getElementById('reset');
const modeSelect = document.getElementById('mode');
const youSelect = document.getElementById('youAre');
const diffSelect = document.getElementById('difficulty');
const youLabel = document.getElementById('youLabel');
const diffLabel = document.getElementById('diffLabel');

const xWinsEl = document.getElementById('xWins');
const oWinsEl = document.getElementById('oWins');
const drawsEl = document.getElementById('draws');

let board = Array(9).fill(null);
let current = 'X';
let isGameOver = false;
let scores = { X:0, O:0, D:0 };

const winningCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function createBoard(){
  boardEl.innerHTML = '';
  for(let i=0;i<9;i++){
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.setAttribute('role','button');
    cell.setAttribute('tabindex','0');
    cell.addEventListener('click', onCellClick);
    cell.addEventListener('keydown', (e)=> { if(e.key === 'Enter') onCellClick(e); });
    boardEl.appendChild(cell);
  }
}

function onCellClick(e){
  if(isGameOver) return;
  const idx = Number(e.currentTarget.dataset.index);
  if(board[idx]) return;
  const mode = modeSelect.value;
  if(mode === 'human'){
    // normal 2-player turn switching
    makeMove(idx, current);
    postMoveUpdate();
  } else {
    // 1-player mode: only allow human moves on human's turn
    const human = youSelect.value;
    if(current !== human) return;
    makeMove(idx, current);
    postMoveUpdate();
    // if AI turn now, trigger AI
    if(!isGameOver) {
      setTimeout(()=> aiPlay(), 300);
    }
  }
}

function makeMove(idx, player){
  board[idx] = player;
  const cell = boardEl.querySelector(`[data-index="${idx}"]`);
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
}

function postMoveUpdate(){
  const winner = checkWinner(board);
  if(winner || board.every(Boolean)){
    endGame(winner);
    return;
  }
  current = current === 'X' ? 'O' : 'X';
  statusTurn.textContent = current;
}

function checkWinner(brd){
  for(const combo of winningCombos){
    const [a,b,c] = combo;
    if(brd[a] && brd[a] === brd[b] && brd[a] === brd[c]) return brd[a];
  }
  return null;
}

function endGame(winner){
  isGameOver = true;
  if(winner){
    statusTurn.textContent = winner + ' wins!';
    scores[winner] += 1;
  } else {
    statusTurn.textContent = 'Draw!';
    scores.D += 1;
  }
  renderScores();
}

function renderScores(){
  xWinsEl.textContent = scores.X;
  oWinsEl.textContent = scores.O;
  drawsEl.textContent = scores.D;
}

/* AI functions */
function aiPlay(){
  const difficulty = diffSelect.value;
  if(difficulty === 'easy') return aiEasy();
  return aiUnbeatable();
}

function aiEasy(){
  const empties = board.map((v,i)=> v===null ? i : -1).filter(i=>i>=0);
  if(empties.length === 0) return;
  const pick = empties[Math.floor(Math.random()*empties.length)];
  makeMove(pick, current);
  postMoveUpdate();
}

function aiUnbeatable(){
  const aiPlayer = current;
  const move = bestMove(board, aiPlayer);
  if(move !== null && board[move] === null){
    makeMove(move, aiPlayer);
    postMoveUpdate();
  }
}

/* Minimax */
function bestMove(brd, player){
  if(brd.every(cell => cell === null)){
    return 4; // center
  }
  let bestScore = -Infinity;
  let move = null;
  for(let i=0;i<9;i++){
    if(brd[i] === null){
      brd[i] = player;
      const score = minimax(brd, 0, false, player);
      brd[i] = null;
      if(score > bestScore){
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(brd, depth, isMaximizing, aiPlayer){
  const winner = checkWinner(brd);
  if(winner === aiPlayer) return 10 - depth;
  if(winner && winner !== aiPlayer) return depth - 10;
  if(brd.every(Boolean)) return 0;

  const human = aiPlayer === 'X' ? 'O' : 'X';
  if(isMaximizing){
    let best = -Infinity;
    for(let i=0;i<9;i++){
      if(brd[i] === null){
        brd[i] = aiPlayer;
        best = Math.max(best, minimax(brd, depth+1, false, aiPlayer));
        brd[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for(let i=0;i<9;i++){
      if(brd[i] === null){
        brd[i] = human;
        best = Math.min(best, minimax(brd, depth+1, true, aiPlayer));
        brd[i] = null;
      }
    }
    return best;
  }
}

/* Utilities */
function resetGame(preserveScores=true){
  board = Array(9).fill(null);
  isGameOver = false;
  current = 'X';
  statusTurn.textContent = current;
  createBoard();
  if(!preserveScores) scores = { X:0, O:0, D:0 };
  renderScores();
  // Show/hide AI controls based on mode
  toggleModeControls();
  // If AI is set to go first (1-player and AI is 'X'), trigger AI
  const mode = modeSelect.value;
  if(mode === 'ai'){
    const aiSymbol = youSelect.value === 'X' ? 'O' : 'X';
    if(current === aiSymbol){
      setTimeout(()=> aiPlay(), 350);
    }
  }
}

function toggleModeControls(){
  const mode = modeSelect.value;
  if(mode === 'ai'){
    youSelect.style.display = 'inline-block';
    diffSelect.style.display = 'inline-block';
    youLabel.style.display = 'inline-block';
    diffLabel.style.display = 'inline-block';
  } else {
    youSelect.style.display = 'none';
    diffSelect.style.display = 'none';
    youLabel.style.display = 'none';
    diffLabel.style.display = 'none';
  }
}

/* bindings */
resetBtn.addEventListener('click', ()=> resetGame(true));
modeSelect.addEventListener('change', ()=> resetGame(true));
youSelect.addEventListener('change', ()=> resetGame(true));
diffSelect.addEventListener('change', ()=> resetGame(true));

/* initial */
createBoard();
resetGame(true);
