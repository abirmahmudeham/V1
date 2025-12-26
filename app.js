const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const aiToggle = document.getElementById('ai-toggle');
const restartBtn = document.getElementById('restart-btn');
const difficultySelect = document.getElementById('difficulty-select');
const difficultyContainer = document.getElementById('difficulty-container');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const scoreBoxX = document.getElementById('score-box-x');
const scoreBoxO = document.getElementById('score-box-o');
const resultOverlay = document.getElementById('result-overlay');
const winnerIcon = document.getElementById('winner-icon');
const resultText = document.getElementById('result-text');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let isVsAI = false;
let difficulty = 'hard';
let scores = { X: 0, O: 0 };

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.textContent = '';
    });

    restartBtn.addEventListener('click', restartGame);
    resultOverlay.addEventListener('click', () => {
        // Optionally close overlay on click to see board, but usually we just restart
        // Let's do nothing, restart button is outside or we add one inside?
        // User wants pop up, usually you click to dismiss.
        hideOverlay();
        restartGame();
    });

    aiToggle.addEventListener('change', (e) => {
        isVsAI = e.target.checked;
        if (isVsAI) {
            difficultyContainer.classList.remove('hidden');
        } else {
            difficultyContainer.classList.add('hidden');
        }
        restartGame();
    });

    difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
        restartGame();
    });

    updateTurnIndicator();
}

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (board[index] !== '' || !gameActive) return;

    makeMove(index, currentPlayer);

    if (gameActive && isVsAI && currentPlayer === 'O') {
        setTimeout(makeAiMove, 400);
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());

    if (checkWin(player)) {
        endGame(false, player);
    } else if (isDraw()) {
        endGame(true);
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurnIndicator();
    }
}

function updateTurnIndicator() {
    scoreBoxX.classList.remove('active');
    scoreBoxO.classList.remove('active');
    if (currentPlayer === 'X') scoreBoxX.classList.add('active');
    else scoreBoxO.classList.add('active');
}

function makeAiMove() {
    if (!gameActive) return;

    let index;
    // Difficulty Levels
    if (difficulty === 'easy') {
        index = getRandomMove();
    } else if (difficulty === 'medium') {
        // 40% chance of random error
        if (Math.random() < 0.4) index = getRandomMove();
        else index = getBestMove();
    } else {
        index = getBestMove();
    }

    makeMove(index, 'O');
}

function getRandomMove() {
    let emptyIndices = [];
    board.forEach((val, idx) => { if (val === '') emptyIndices.push(idx); });
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

function getBestMove() {
    let bestScore = -Infinity;
    let move;

    if (board.every(cell => cell === '')) return 4; // Center optimization

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(currentBoard, depth, isMaximizing) {
    if (checkWinState(currentBoard, 'O')) return 10 - depth;
    if (checkWinState(currentBoard, 'X')) return depth - 10;
    if (currentBoard.every(cell => cell !== '')) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === '') {
                currentBoard[i] = 'O';
                let score = minimax(currentBoard, depth + 1, false);
                currentBoard[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === '') {
                currentBoard[i] = 'X';
                let score = minimax(currentBoard, depth + 1, true);
                currentBoard[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinState(b, player) {
    return WINNING_COMBINATIONS.some(c => c.every(i => b[i] === player));
}
function checkWin(player) { return checkWinState(board, player); }
function isDraw() { return board.every(cell => cell !== ''); }

function endGame(draw, winner) {
    gameActive = false;

    if (!draw) {
        scores[winner]++;
        updateScores();
    }

    showOverlay(draw, winner);
}

function updateScores() {
    scoreXElement.innerText = scores.X;
    scoreOElement.innerText = scores.O;
}

function showOverlay(draw, winner) {
    resultOverlay.classList.remove('hidden');
    // Force reflow for transition?
    void resultOverlay.offsetWidth;
    resultOverlay.classList.add('active');

    winnerIcon.className = 'winner-icon'; // Reset
    winnerIcon.innerHTML = ''; // Clear content

    if (draw) {
        winnerIcon.classList.add('draw');
        winnerIcon.innerHTML = '<span>X</span><span>O</span>';
        resultText.innerText = "DRAW!";
    } else {
        winnerIcon.classList.add(winner === 'X' ? 'x-win' : 'o-win');
        resultText.innerText = "WINNER!";
    }
}

function hideOverlay() {
    resultOverlay.classList.remove('active');
    setTimeout(() => {
        resultOverlay.classList.add('hidden');
    }, 300); // Wait for transition
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell'; // remove x/o classes
    });
    hideOverlay();
    updateTurnIndicator();
}

init();
