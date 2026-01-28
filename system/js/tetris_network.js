/**
 * Tetris Network Manager
 * Socket.ioを使用したリアルタイム通信と対戦同期の管理
 */

class TetrisNetwork {
    constructor(engine) {
        this.engine = engine;
        this.socket = null;
        this.roomId = null;
        this.opponents = new Map(); // 相手の盤面データを保持
    }

    /**
     * Ubuntuサーバーへ接続
     */
    connect() {
        // UbuntuサーバーのIPに書き換え済み
        this.socket = io('http://210.131.214.117:3000', {
            auth: {
                token: sessionStorage.getItem('authToken')
            }
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        // 接続成功
        this.socket.on('connect', () => {
            console.log('Connected to battle server');
        });

        // 部屋への入室完了
        this.socket.on('room-joined', (data) => {
            this.roomId = data.roomId;
            console.log(`Joined room: ${this.roomId}`);
        });

        // 相手の盤面更新データを受信
        this.socket.on('opponent-update', (data) => {
            this.opponents.set(data.userId, data);
            this.renderOpponents();
        });

        // お邪魔ブロック（攻撃）の受信
        this.socket.on('receive-attack', (data) => {
            console.log(`Incoming attack: ${data.lines} lines from ${data.from}`);
            this.engine.queueGarbage(data.lines);
        });

        // 誰かが脱落した
        this.socket.on('player-eliminated', (userId) => {
            console.log(`Player ${userId} is out!`);
        });
    }

    /**
     * 自分の盤面状態を全員に送信
     */
    sendUpdate() {
        if (!this.socket) return;
        
        const gameState = {
            grid: this.engine.grid,
            next: this.engine.nextQueue.slice(0, 1),
            hold: this.engine.holdPiece,
            isGameOver: this.engine.gameOver
        };
        
        this.socket.emit('update-board', gameState);
    }

    /**
     * 相手に攻撃を送信
     */
    sendAttack(lines) {
        if (!this.socket || lines <= 0) return;
        
        this.socket.emit('send-attack', {
            roomId: this.roomId,
            lines: lines
        });
    }

    /**
     * 相手（最大9人）の盤面をサブキャンバスに描画
     */
    renderOpponents() {
        const gridContainer = document.getElementById('opponents-grid');
        if (!gridContainer) return;

        this.opponents.forEach((data, userId) => {
            let canvas = document.getElementById(`opp-canvas-${userId}`);
            
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = `opp-canvas-${userId}`;
                canvas.className = 'opponent-canvas';
                canvas.width = 80;
                canvas.height = 160;
                gridContainer.appendChild(canvas);
            }

            this.drawOpponentGrid(canvas, data.grid);
        });
    }

    drawOpponentGrid(canvas, grid) {
        const ctx = canvas.getContext('2d');
        const cellSize = canvas.width / 10;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        grid.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    ctx.fillStyle = cell === 1 ? '#555' : cell;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
                }
            });
        });
    }
}
