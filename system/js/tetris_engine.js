/**
 * Tetris Engine - Core Logic
 * 仕様: 10x20グリッド, DT砲/T-Spin判定, 4-Next, Hold, 攻撃システム
 */

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// ミノの定義 (I, J, L, O, S, T, Z)
const SHAPES = {
    'I': [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    'J': [[1,0,0],[1,1,1],[0,0,0]],
    'L': [[0,0,1],[1,1,1],[0,0,0]],
    'O': [[1,1],[1,1]],
    'S': [[0,1,1],[1,1,0],[0,0,0]],
    'T': [[0,1,0],[1,1,1],[0,0,0]],
    'Z': [[1,1,0],[0,1,1],[0,0,0]]
};

const COLORS = {
    'I': '#00f0ff', 'J': '#0000ff', 'L': '#ff7f00',
    'O': '#ffff00', 'S': '#00ff00', 'T': '#a000f0', 'Z': '#ff0000'
};

class TetrisEngine {
    constructor(canvasId, isPlayer = true) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isPlayer = isPlayer;
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        this.nextQueue = this.generateNewBag();
        this.holdPiece = null;
        this.canHold = true;
        this.score = 0;
        this.combo = 0;
        this.gameOver = false;
        
        this.currentPiece = this.spawnPiece();
    }

    // 7種1セット（7-Bagシステム）
    generateNewBag() {
        let bag = Object.keys(SHAPES);
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        return bag;
    }

    spawnPiece() {
        const type = this.nextQueue.shift();
        if (this.nextQueue.length < 5) {
            this.nextQueue.push(...this.generateNewBag());
        }
        
        const piece = {
            type: type,
            shape: SHAPES[type],
            color: COLORS[type],
            x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
            y: 0
        };

        if (this.checkCollision(piece.x, piece.y, piece.shape)) {
            this.gameOver = true;
        }
        return piece;
    }

    // T-Spin 判定 (3-Corner Method)
    checkTSpin(piece, x, y, shape) {
        if (piece.type !== 'T') return false;
        
        let corners = 0;
        const cornerPositions = [[0,0], [0,2], [2,0], [2,2]];
        cornerPositions.forEach(([cx, cy]) => {
            if (this.isOccupied(x + cx, y + cy)) corners++;
        });
        
        return corners >= 3;
    }

    isOccupied(x, y) {
        if (x < 0 || x >= COLS || y >= ROWS) return true;
        if (y < 0) return false;
        return this.grid[y][x] !== 0;
    }

    // ライン消去 & 攻撃計算
    clearLines() {
        let linesCleared = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(COLS).fill(0));
                linesCleared++;
                y++;
            }
        }

        if (linesCleared > 0) {
            this.calculateAttack(linesCleared);
        } else {
            this.combo = 0;
        }
    }

    calculateAttack(lines) {
        let power = 0;
        // 基本攻撃
        if (lines === 2) power = 1;
        if (lines === 3) power = 2;
        if (lines === 4) power = 4; // Tetris

        // T-Spin / DT砲 簡易ボーナス
        // 実際には回転直後の消去か判定が必要
        if (this.lastMoveTSpin) {
            power += lines * 2;
            console.log("T-Spin!");
        }

        this.combo++;
        if (this.combo > 1) power += Math.floor(this.combo / 2);

        this.sendAttack(power);
    }

    sendAttack(power) {
        if (power <= 0) return;
        console.log(`Attack sent: ${power} lines`);
        // オンラインならSocket通信、オフラインならCPUへ
    }

    // 描画処理: くっきりグリッド
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // グリッド線
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        for (let i = 0; i <= COLS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * BLOCK_SIZE, 0);
            this.ctx.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
            this.ctx.stroke();
        }
        for (let i = 0; i <= ROWS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * BLOCK_SIZE);
            this.ctx.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE);
            this.ctx.stroke();
        }

        // 設置済みブロック
        this.grid.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) this.drawBlock(x, y, cell);
            });
        });

        // 現在のミノ
        if (this.currentPiece) {
            this.currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.drawBlock(this.currentPiece.x + x, this.currentPiece.y + y, this.currentPiece.color);
                    }
                });
            });
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        // 枠線をくっきり
        this.ctx.strokeStyle = "rgba(255,255,255,0.3)";
        this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
}