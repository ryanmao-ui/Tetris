// Tetris game in JavaScript for browser
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const gameOverDiv = document.getElementById('game-over');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#0ff', // I
    '#00f', // J
    '#fa0', // L
    '#ff0', // O
    '#0f0', // S
    '#f00', // Z
    '#808'  // T
];

const SHAPES = [
    [],
    [ // I
        [1, 1, 1, 1]
    ],
    [ // J
        [1, 0, 0],
        [1, 1, 1]
    ],
    [ // L
        [0, 0, 1],
        [1, 1, 1]
    ],
    [ // O
        [1, 1],
        [1, 1]
    ],
    [ // S
        [0, 1, 1],
        [1, 1, 0]
    ],
    [ // Z
        [1, 1, 0],
        [0, 1, 1]
    ],
    [ // T
        [0, 1, 0],
        [1, 1, 1]
    ]
];

function randomPiece() {
    const type = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    return {
        x: Math.floor(COLS / 2) - Math.ceil(SHAPES[type][0].length / 2),
        y: 0,
        shape: SHAPES[type],
        type: type
    };
}

function rotate(shape) {
    return shape[0].map((_, i) => shape.map(row => row[i])).reverse();
}

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let piece = randomPiece();
let score = 0;
let gameOver = false;
let dropInterval = 500;
let lastDrop = Date.now();

function collision(px, py, shape) {
    for (let y = 0; y < shape.length; ++y) {
        for (let x = 0; x < shape[y].length; ++x) {
            if (shape[y][x]) {
                let nx = px + x;
                let ny = py + y;
                if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                if (ny >= 0 && board[ny][nx]) return true;
            }
        }
    }
    return false;
}

function merge() {
    piece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                let nx = piece.x + x;
                let ny = piece.y + y;
                if (ny >= 0) board[ny][nx] = piece.type;
            }
        });
    });
}

function clearLines() {
    let lines = 0;
    for (let y = ROWS - 1; y >= 0; --y) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            lines++;
            y++;
        }
    }
    score += lines * 100;
}

function drawBlock(x, y, type) {
    ctx.fillStyle = COLORS[type];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#888';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw board
    for (let y = 0; y < ROWS; ++y) {
        for (let x = 0; x < COLS; ++x) {
            if (board[y][x]) drawBlock(x, y, board[y][x]);
        }
    }
    // Draw current piece
    piece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                let nx = piece.x + x;
                let ny = piece.y + y;
                if (ny >= 0) drawBlock(nx, ny, piece.type);
            }
        });
    });
    scoreDiv.textContent = 'Score: ' + score;
    gameOverDiv.style.display = gameOver ? 'block' : 'none';
}

function drop() {
    if (!gameOver) {
        if (!collision(piece.x, piece.y + 1, piece.shape)) {
            piece.y++;
        } else {
            merge();
            clearLines();
            piece = randomPiece();
            if (collision(piece.x, piece.y, piece.shape)) {
                gameOver = true;
            }
        }
    }
}

function hardDrop() {
    while (!collision(piece.x, piece.y + 1, piece.shape)) {
        piece.y++;
    }
    drop();
}

function restart() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    piece = randomPiece();
    score = 0;
    gameOver = false;
}

document.addEventListener('keydown', e => {
    if (!gameOver) {
        if (e.key === 'ArrowLeft' && !collision(piece.x - 1, piece.y, piece.shape)) {
            piece.x--;
        } else if (e.key === 'ArrowRight' && !collision(piece.x + 1, piece.y, piece.shape)) {
            piece.x++;
        } else if (e.key === 'ArrowDown') {
            drop();
        } else if (e.key === 'ArrowUp') {
            const rotated = rotate(piece.shape);
            if (!collision(piece.x, piece.y, rotated)) piece.shape = rotated;
        } else if (e.key === ' ') {
            hardDrop();
        }
    } else if (e.key.toLowerCase() === 'r') {
        restart();
    }
    draw();
});

function update() {
    if (!gameOver && Date.now() - lastDrop > dropInterval) {
        drop();
        lastDrop = Date.now();
    }
    draw();
    requestAnimationFrame(update);
}

draw();
update();
