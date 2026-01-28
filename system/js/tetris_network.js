class TetrisNetwork {
    constructor(game) {
        this.game = game;
        // Ubuntuサーバーへ接続
        this.socket = io('http://210.131.214.117:3000', {
            transports: ['websocket']
        });

        this.setupListeners();
    }

    setupListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to Server');
            this.socket.emit('join-room', { roomId: 'main-room' });
        });

        // 相手の動きを受信
        this.socket.on('opponent-update', (data) => {
            if (this.game.drawOpponent) {
                this.game.drawOpponent(data.board, data.score);
            }
        });

        // 攻撃を受信
        this.socket.on('receive-attack', (data) => {
            this.game.pendingGarbage += data.lines;
        });
    }

    // 自分のデータを送信
    sendUpdate(board, score) {
        this.socket.emit('update-board', { board, score });
    }

    // 相手へ攻撃を送信
    sendAttack(lines) {
        this.socket.emit('send-attack', { lines });
    }
}
