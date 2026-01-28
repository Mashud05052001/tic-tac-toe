// Game JavaScript for Ultimate Tic-Tac-Toe

document.addEventListener('DOMContentLoaded', function () {
    // Game state
    const gameState = {
        mode: localStorage.getItem('gameMode') || 'pve',
        currentPlayer: 'X', // X always starts
        nextBoard: -1, // -1 means any board
        boards: Array(9).fill().map(() => Array(9).fill('')), // 9x9 cells
        smallBoardStatus: Array(9).fill(''), // 'X', 'O', 'D' (draw), or ''
        gameOver: false,
        winner: '',
        moveHistory: [],
        moveCount: 0,
        startTime: Date.now(),
        timerInterval: null,
        aiThinking: false,
        highlightMoves: true,
        showHints: false,
        animations: true
    };

    // DOM Elements
    const ultimateBoard = document.getElementById('ultimateBoard');
    const playerXName = document.getElementById('playerXName');
    const playerOName = document.getElementById('playerOName');
    const currentPlayerSpan = document.getElementById('currentPlayer');
    const nextBoardIndicator = document.getElementById('nextBoardIndicator');
    const moveHistoryContainer = document.getElementById('moveHistory');
    const xWonBoards = document.getElementById('xWonBoards');
    const oWonBoards = document.getElementById('oWonBoards');
    const aiNameDisplay = document.getElementById('aiNameDisplay');
    const aiDifficulty = document.getElementById('aiDifficulty');
    const aiThinkingSpan = document.getElementById('aiThinking');
    const gameTimer = document.getElementById('gameTimer');
    const moveCount = document.getElementById('moveCount');
    const gameModeDisplay = document.getElementById('gameModeDisplay');
    const aiControls = document.getElementById('aiControls');
    const aiHintBtn = document.getElementById('aiHintBtn');
    const aiMoveBtn = document.getElementById('aiMoveBtn');

    // Load settings
    const settings = JSON.parse(localStorage.getItem('ultimateTicTacToeSettings')) || {};

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        const themeBtn = document.getElementById('gameThemeToggle');
        if (themeBtn) {
            const themeIcon = themeBtn.querySelector('i');
            themeIcon.className = 'fas fa-moon';
        }
    } else {
        document.body.classList.add('dark-theme');
        const themeBtn = document.getElementById('gameThemeToggle');
        if (themeBtn) {
            const themeIcon = themeBtn.querySelector('i');
            themeIcon.className = 'fas fa-sun';
        }
    }

    // Initialize game
    function initGame() {
        // Set player names
        if (gameState.mode === 'pvp') {
            playerXName.textContent = settings.player1Name || 'Player 1';
            playerOName.textContent = settings.player2Name || 'Player 2';
            gameModeDisplay.textContent = 'Player vs Player';
            aiControls.style.display = 'none';
        } else {
            playerXName.textContent = settings.player1Name || 'Player 1';
            playerOName.textContent = settings.aiName || 'AI Agent';
            gameModeDisplay.textContent = 'Player vs AI';
            aiControls.style.display = 'flex';
            aiNameDisplay.textContent = settings.aiName || 'AI Agent';
            aiDifficulty.textContent = settings.aiDifficulty ?
                settings.aiDifficulty.charAt(0).toUpperCase() + settings.aiDifficulty.slice(1) : 'Medium';
        }

        // Apply settings
        gameState.highlightMoves = settings.highlightMoves !== false;
        gameState.showHints = settings.showHints || false;
        gameState.animations = settings.animations !== false;

        // Create the ultimate board
        createUltimateBoard();

        // Update UI
        updateGameInfo();

        // Start timer
        startTimer();

        // If AI starts first
        if (gameState.mode === 'pve' && gameState.currentPlayer === 'X' && settings.player1Name !== 'Player 1') {
            // In PvE mode, human is X by default
            // AI would be O and goes second
        }

        // Set up event listeners
        setupEventListeners();
    }

    // Create the ultimate board (9 small boards)
    function createUltimateBoard() {
        ultimateBoard.innerHTML = '';

        for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
            const smallBoard = document.createElement('div');
            smallBoard.className = 'small-board-game';
            smallBoard.dataset.boardIndex = boardIndex;

            // Add overlay for won/draw boards
            const overlay = document.createElement('div');
            overlay.className = 'board-overlay';
            overlay.style.display = 'none';
            smallBoard.appendChild(overlay);

            // Create 3x3 grid for cells
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                const cell = document.createElement('div');
                cell.className = 'cell-game';
                cell.dataset.boardIndex = boardIndex;
                cell.dataset.cellIndex = cellIndex;
                cell.dataset.position = `${Math.floor(cellIndex / 3) + 1},${(cellIndex % 3) + 1}`;
                cell.textContent = gameState.boards[boardIndex][cellIndex];

                if (gameState.boards[boardIndex][cellIndex] === 'X') {
                    cell.classList.add('x');
                } else if (gameState.boards[boardIndex][cellIndex] === 'O') {
                    cell.classList.add('o');
                }

                // Add click event
                cell.addEventListener('click', () => handleCellClick(boardIndex, cellIndex));

                smallBoard.appendChild(cell);
            }

            ultimateBoard.appendChild(smallBoard);
        }

        updateBoardHighlights();
    }

    // Handle cell click
    function handleCellClick(boardIndex, cellIndex) {
        // Check if game is over
        if (gameState.gameOver) return;

        // Check if it's human's turn (in PvE mode, AI's turn is handled automatically)
        if (gameState.mode === 'pve' && gameState.currentPlayer === 'O') {
            // It's AI's turn
            return;
        }

        // Check if the board is allowed
        if (gameState.nextBoard !== -1 && gameState.nextBoard !== boardIndex) {
            // This board is not allowed
            if (gameState.animations) {
                // Show visual feedback
                const board = document.querySelector(`.small-board-game[data-board-index="${boardIndex}"]`);
                board.style.animation = 'none';
                setTimeout(() => {
                    board.style.animation = 'shake 0.5s';
                }, 10);

                // Add shake animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                        20%, 40%, 60%, 80% { transform: translateX(5px); }
                    }
                `;
                document.head.appendChild(style);
                setTimeout(() => style.remove(), 500);
            }
            return;
        }

        // Check if cell is empty
        if (gameState.boards[boardIndex][cellIndex] !== '') {
            // Cell is already taken
            return;
        }

        // Make the move
        makeMove(boardIndex, cellIndex);
    }

    function makeMove(boardIndex, cellIndex) {
        // Prevent invalid moves
        if (gameState.gameOver) return;
        if (gameState.boards[boardIndex][cellIndex] !== '') return;

        // Update game state
        gameState.boards[boardIndex][cellIndex] = gameState.currentPlayer;
        gameState.moveCount++;

        // Add to move history
        const move = {
            player: gameState.currentPlayer,
            board: boardIndex,
            cell: cellIndex,
            position: `${Math.floor(cellIndex / 3) + 1},${(cellIndex % 3) + 1}`,
            moveNumber: gameState.moveCount
        };
        gameState.moveHistory.push(move);

        // Update UI
        updateCell(boardIndex, cellIndex);
        updateMoveHistory();
        updateMoveCount();

        // Check if the small board is won
        checkSmallBoardWinner(boardIndex);

        // Determine next board
        const nextBoard = cellIndex;

        // Check if next board is valid (not won and not full)
        if (
            gameState.smallBoardStatus[nextBoard] === '' &&
            !isBoardFull(nextBoard)
        ) {
            gameState.nextBoard = nextBoard;
        } else {
            gameState.nextBoard = -1; // Any board
        }

        // Check if game is over
        checkGameOver();

        // If game ended, show modal and stop
        if (gameState.gameOver) {
            showGameOverModal();
            return;
        }

        // Switch player
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';

        // Update UI
        updateGameInfo();
        updateBoardHighlights();

        // AI turn (PvE only) - add 200ms thinking delay
        if (gameState.mode === 'pve' && gameState.currentPlayer === 'O') {
            // Show AI thinking indicator
            gameState.aiThinking = true;
            aiThinkingSpan.textContent = 'Yes';

            // Wait 200ms then execute AI move
            setTimeout(() => {
                makeAIMove();
                gameState.aiThinking = false;
                aiThinkingSpan.textContent = 'No';
            }, 200);
        }
    }


    // Update cell in UI
    function updateCell(boardIndex, cellIndex) {
        const cell = document.querySelector(`.cell-game[data-board-index="${boardIndex}"][data-cell-index="${cellIndex}"]`);
        cell.textContent = gameState.currentPlayer;
        cell.classList.add(gameState.currentPlayer.toLowerCase());

        if (gameState.animations) {
            cell.style.animation = 'popIn 0.3s';
            const style = document.createElement('style');
            style.textContent = `
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    70% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            setTimeout(() => style.remove(), 300);
        }
    }

    // Check if a small board has a winner
    function checkSmallBoardWinner(boardIndex) {
        const board = gameState.boards[boardIndex];

        // Check rows
        for (let i = 0; i < 3; i++) {
            if (board[i * 3] !== '' && board[i * 3] === board[i * 3 + 1] && board[i * 3] === board[i * 3 + 2]) {
                gameState.smallBoardStatus[boardIndex] = board[i * 3];
                updateSmallBoardStatus(boardIndex);
                return;
            }
        }

        // Check columns
        for (let i = 0; i < 3; i++) {
            if (board[i] !== '' && board[i] === board[i + 3] && board[i] === board[i + 6]) {
                gameState.smallBoardStatus[boardIndex] = board[i];
                updateSmallBoardStatus(boardIndex);
                return;
            }
        }

        // Check diagonals
        if (board[0] !== '' && board[0] === board[4] && board[0] === board[8]) {
            gameState.smallBoardStatus[boardIndex] = board[0];
            updateSmallBoardStatus(boardIndex);
            return;
        }

        if (board[2] !== '' && board[2] === board[4] && board[2] === board[6]) {
            gameState.smallBoardStatus[boardIndex] = board[2];
            updateSmallBoardStatus(boardIndex);
            return;
        }

        // Check for draw
        if (isBoardFull(boardIndex)) {
            gameState.smallBoardStatus[boardIndex] = 'D';
            updateSmallBoardStatus(boardIndex);
        }
    }

    // Check if a small board is full
    function isBoardFull(boardIndex) {
        return gameState.boards[boardIndex].every(cell => cell !== '');
    }

    // Update small board status in UI
    function updateSmallBoardStatus(boardIndex) {
        const smallBoard = document.querySelector(`.small-board-game[data-board-index="${boardIndex}"]`);
        const overlay = smallBoard.querySelector('.board-overlay');

        if (gameState.smallBoardStatus[boardIndex] === 'X') {
            smallBoard.classList.add('won-x');
            overlay.textContent = 'X';
            overlay.className = 'board-overlay x';
            overlay.style.display = 'flex';

            // Update won boards list
            updateWonBoards();
        } else if (gameState.smallBoardStatus[boardIndex] === 'O') {
            smallBoard.classList.add('won-o');
            overlay.textContent = 'O';
            overlay.className = 'board-overlay o';
            overlay.style.display = 'flex';

            // Update won boards list
            updateWonBoards();
        } else if (gameState.smallBoardStatus[boardIndex] === 'D') {
            smallBoard.classList.add('draw');
            overlay.textContent = 'Draw';
            overlay.className = 'board-overlay draw';
            overlay.style.display = 'flex';
        }
    }

    // Check if game is over
    function checkGameOver() {
        // Check rows
        for (let i = 0; i < 3; i++) {
            if (gameState.smallBoardStatus[i * 3] !== '' &&
                gameState.smallBoardStatus[i * 3] !== 'D' &&
                gameState.smallBoardStatus[i * 3] === gameState.smallBoardStatus[i * 3 + 1] &&
                gameState.smallBoardStatus[i * 3] === gameState.smallBoardStatus[i * 3 + 2]) {
                gameState.gameOver = true;
                gameState.winner = gameState.smallBoardStatus[i * 3];
                return;
            }
        }

        // Check columns
        for (let i = 0; i < 3; i++) {
            if (gameState.smallBoardStatus[i] !== '' &&
                gameState.smallBoardStatus[i] !== 'D' &&
                gameState.smallBoardStatus[i] === gameState.smallBoardStatus[i + 3] &&
                gameState.smallBoardStatus[i] === gameState.smallBoardStatus[i + 6]) {
                gameState.gameOver = true;
                gameState.winner = gameState.smallBoardStatus[i];
                return;
            }
        }

        // Check diagonals
        if (gameState.smallBoardStatus[0] !== '' &&
            gameState.smallBoardStatus[0] !== 'D' &&
            gameState.smallBoardStatus[0] === gameState.smallBoardStatus[4] &&
            gameState.smallBoardStatus[0] === gameState.smallBoardStatus[8]) {
            gameState.gameOver = true;
            gameState.winner = gameState.smallBoardStatus[0];
            return;
        }

        if (gameState.smallBoardStatus[2] !== '' &&
            gameState.smallBoardStatus[2] !== 'D' &&
            gameState.smallBoardStatus[2] === gameState.smallBoardStatus[4] &&
            gameState.smallBoardStatus[2] === gameState.smallBoardStatus[6]) {
            gameState.gameOver = true;
            gameState.winner = gameState.smallBoardStatus[2];
            return;
        }

        // Check for draw (all boards are won or drawn)
        if (gameState.smallBoardStatus.every(status => status !== '')) {
            gameState.gameOver = true;
            gameState.winner = 'D';
        }
    }

    // Update game info in UI
    function updateGameInfo() {
        // Update current player
        currentPlayerSpan.textContent = gameState.currentPlayer === 'X' ?
            playerXName.textContent : playerOName.textContent;

        // Update turn indicator
        const turnIndicator = document.querySelector('.turn-indicator');
        turnIndicator.className = `turn-indicator ${gameState.currentPlayer.toLowerCase()}-turn`;
        turnIndicator.innerHTML = `<i class="fas fa-${gameState.currentPlayer === 'X' ? 'times' : 'circle'}"></i>`;

        // Update next board indicator
        if (gameState.nextBoard === -1) {
            nextBoardIndicator.textContent = 'Any';
            nextBoardIndicator.style.color = '';
        } else {
            nextBoardIndicator.textContent = `Board ${gameState.nextBoard + 1}`;
            nextBoardIndicator.style.color = 'var(--accent-color)';
        }

        // Update player status
        const playerXStatus = document.querySelector('.player-x .player-status');
        const playerOStatus = document.querySelector('.player-o .player-status');

        if (gameState.currentPlayer === 'X') {
            playerXStatus.textContent = 'Your Turn';
            playerOStatus.textContent = 'Waiting';
            document.querySelector('.player-x').classList.add('active');
            document.querySelector('.player-o').classList.remove('active');
        } else {
            playerXStatus.textContent = 'Waiting';
            playerOStatus.textContent = gameState.mode === 'pvp' ? 'Your Turn' : 'AI Turn';
            document.querySelector('.player-x').classList.remove('active');
            document.querySelector('.player-o').classList.add('active');
        }
    }

    // Update board highlights
    function updateBoardHighlights() {
        // Remove all active classes
        document.querySelectorAll('.small-board-game').forEach(board => {
            board.classList.remove('active');
        });

        // Remove all allowed classes from cells
        document.querySelectorAll('.cell-game.allowed').forEach(cell => {
            cell.classList.remove('allowed');
        });

        // Highlight allowed boards
        if (gameState.nextBoard === -1) {
            // All boards that are not won and not full are allowed
            for (let i = 0; i < 9; i++) {
                if (gameState.smallBoardStatus[i] === '' && !isBoardFull(i)) {
                    document.querySelector(`.small-board-game[data-board-index="${i}"]`).classList.add('active');
                }
            }
        } else {
            // Only the specified board is allowed
            if (gameState.smallBoardStatus[gameState.nextBoard] === '' && !isBoardFull(gameState.nextBoard)) {
                document.querySelector(`.small-board-game[data-board-index="${gameState.nextBoard}"]`).classList.add('active');
            }

            // Highlight allowed cells in the active board
            if (gameState.highlightMoves) {
                const board = gameState.boards[gameState.nextBoard];
                for (let i = 0; i < 9; i++) {
                    if (board[i] === '') {
                        const cell = document.querySelector(`.cell-game[data-board-index="${gameState.nextBoard}"][data-cell-index="${i}"]`);
                        cell.classList.add('allowed');
                    }
                }
            }
        }
    }

    // Update move history
    function updateMoveHistory() {
        moveHistoryContainer.innerHTML = '';

        // Show only last 10 moves
        const startIndex = Math.max(0, gameState.moveHistory.length - 10);

        for (let i = startIndex; i < gameState.moveHistory.length; i++) {
            const move = gameState.moveHistory[i];
            const moveItem = document.createElement('div');
            moveItem.className = `move-item ${move.player.toLowerCase()}-move`;
            moveItem.innerHTML = `
                <div>
                    <span class="move-player">${move.player === 'X' ? playerXName.textContent : playerOName.textContent}</span>
                    <span class="move-details"> (Move ${move.moveNumber})</span>
                </div>
                <div class="move-position">Board ${move.board + 1}, Cell ${move.position}</div>
            `;
            moveHistoryContainer.appendChild(moveItem);
        }

        // Scroll to bottom
        moveHistoryContainer.scrollTop = moveHistoryContainer.scrollHeight;
    }

    // Update won boards list
    function updateWonBoards() {
        xWonBoards.innerHTML = '';
        oWonBoards.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            if (gameState.smallBoardStatus[i] === 'X') {
                const boardIndicator = document.createElement('div');
                boardIndicator.className = 'won-board-indicator x-won-board';
                boardIndicator.textContent = i + 1;
                xWonBoards.appendChild(boardIndicator);
            } else if (gameState.smallBoardStatus[i] === 'O') {
                const boardIndicator = document.createElement('div');
                boardIndicator.className = 'won-board-indicator o-won-board';
                boardIndicator.textContent = i + 1;
                oWonBoards.appendChild(boardIndicator);
            }
        }
    }

    // Start game timer
    function startTimer() {
        gameState.startTime = Date.now();

        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }

        gameState.timerInterval = setInterval(() => {
            const elapsed = Date.now() - gameState.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            gameTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // Update move count
    function updateMoveCount() {
        moveCount.textContent = gameState.moveCount;
    }

    // AI move logic (simplified - will be enhanced in ai.js)
    function makeAIMove() {
        if (gameState.gameOver) return;

        // Get all possible moves
        const possibleMoves = [];

        // Determine which boards are allowed
        let allowedBoards = [];
        if (gameState.nextBoard === -1) {
            // Any board that is not won and not full
            for (let i = 0; i < 9; i++) {
                if (gameState.smallBoardStatus[i] === '' && !isBoardFull(i)) {
                    allowedBoards.push(i);
                }
            }
        } else {
            // Only the specified board, if it's not won and not full
            if (gameState.smallBoardStatus[gameState.nextBoard] === '' && !isBoardFull(gameState.nextBoard)) {
                allowedBoards.push(gameState.nextBoard);
            } else {
                // If the specified board is won or full, any board is allowed
                for (let i = 0; i < 9; i++) {
                    if (gameState.smallBoardStatus[i] === '' && !isBoardFull(i)) {
                        allowedBoards.push(i);
                    }
                }
            }
        }

        // Get all empty cells in allowed boards
        for (const boardIndex of allowedBoards) {
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                if (gameState.boards[boardIndex][cellIndex] === '') {
                    possibleMoves.push({ boardIndex, cellIndex });
                }
            }
        }

        if (possibleMoves.length === 0) {
            // No moves available
            return;
        }

        // Choose a move based on difficulty
        const difficulty = settings.aiDifficulty || 'medium';
        let move;

        if (difficulty === 'easy') {
            // Random move
            move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else if (difficulty === 'medium' || difficulty === 'hard') {
            // Use Minimax algorithm (simplified - will be enhanced in ai.js)
            // For now, just pick a random move
            move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

            // Try to find a winning move
            for (const possibleMove of possibleMoves) {
                // Simulate the move
                gameState.boards[possibleMove.boardIndex][possibleMove.cellIndex] = 'O';

                // Check if this move wins the small board
                const tempBoard = [...gameState.boards[possibleMove.boardIndex]];
                const tempCell = possibleMove.cellIndex;

                // Check if this move creates 3 in a row
                // This is a simplified check
                const row = Math.floor(tempCell / 3);
                const col = tempCell % 3;
                let win = false;

                // Check row
                if (tempBoard[row * 3] === 'O' && tempBoard[row * 3 + 1] === 'O' && tempBoard[row * 3 + 2] === 'O') {
                    win = true;
                }

                // Check column
                if (tempBoard[col] === 'O' && tempBoard[col + 3] === 'O' && tempBoard[col + 6] === 'O') {
                    win = true;
                }

                // Check diagonals
                if (tempCell % 4 === 0 && tempBoard[0] === 'O' && tempBoard[4] === 'O' && tempBoard[8] === 'O') {
                    win = true;
                }

                if (tempCell % 2 === 0 && tempCell !== 0 && tempCell !== 8 &&
                    tempBoard[2] === 'O' && tempBoard[4] === 'O' && tempBoard[6] === 'O') {
                    win = true;
                }

                // Undo the simulation
                gameState.boards[possibleMove.boardIndex][possibleMove.cellIndex] = '';

                if (win) {
                    move = possibleMove;
                    break;
                }
            }
        }

        // Make the AI move immediately
        if (move) {
            makeMove(move.boardIndex, move.cellIndex);
        }
    }

    // Show game over modal
    function showGameOverModal() {
        const modal = document.getElementById('gameOverModal');
        const gameResult = document.getElementById('gameResult');
        const winnerName = document.getElementById('winnerName');
        const totalMoves = document.getElementById('totalMoves');
        const totalTime = document.getElementById('totalTime');
        const finalGameMode = document.getElementById('finalGameMode');

        // Stop timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }

        // Set result based on winner
        if (gameState.winner === 'X') {
            gameResult.innerHTML = `
                <div class="result-icon win">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="result-text">
                    <h3>${playerXName.textContent} Wins!</h3>
                    <p>Congratulations on your victory!</p>
                </div>
            `;
            winnerName.textContent = playerXName.textContent;
        } else if (gameState.winner === 'O') {
            gameResult.innerHTML = `
                <div class="result-icon ${gameState.mode === 'pvp' ? 'win' : 'lose'}">
                    <i class="fas fa-${gameState.mode === 'pvp' ? 'trophy' : 'robot'}"></i>
                </div>
                <div class="result-text">
                    <h3>${playerOName.textContent} ${gameState.mode === 'pvp' ? 'Wins!' : 'Wins!'}</h3>
                    <p>${gameState.mode === 'pvp' ? 'Congratulations!' : 'Better luck next time!'}</p>
                </div>
            `;
            winnerName.textContent = playerOName.textContent;
        } else {
            gameResult.innerHTML = `
                <div class="result-icon draw">
                    <i class="fas fa-handshake"></i>
                </div>
                <div class="result-text">
                    <h3>It's a Draw!</h3>
                    <p>The game ended in a tie.</p>
                </div>
            `;
            winnerName.textContent = '-';
        }

        // Set other stats
        totalMoves.textContent = gameState.moveCount;
        totalTime.textContent = gameTimer.textContent;
        finalGameMode.textContent = gameModeDisplay.textContent;

        // Show modal
        modal.classList.add('active');
    }

    // Setup event listeners
    function setupEventListeners() {
        // New game button
        document.getElementById('newGameBtn').addEventListener('click', function () {
            if (confirm('Start a new game? Current game progress will be lost.')) {
                resetGame();
            }
        });

        // Game settings button
        document.getElementById('gameSettingsBtn').addEventListener('click', function () {
            showGameSettingsModal();
        });

        // Game theme toggle
        document.getElementById('gameThemeToggle').addEventListener('click', function () {
            const themeIcon = this.querySelector('i');
            document.body.classList.toggle('dark-theme');

            // Update icon based on theme
            if (document.body.classList.contains('dark-theme')) {
                themeIcon.className = 'fas fa-sun';
            } else {
                themeIcon.className = 'fas fa-moon';
            }

            localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        });

        // Clear history button
        document.getElementById('clearHistoryBtn').addEventListener('click', function () {
            if (confirm('Clear move history?')) {
                gameState.moveHistory = [];
                updateMoveHistory();
            }
        });

        // AI hint button
        if (aiHintBtn) {
            aiHintBtn.addEventListener('click', function () {
                if (gameState.mode === 'pve' && gameState.currentPlayer === 'X' && !gameState.gameOver) {
                    // Show a hint for the human player
                    showHint();
                }
            });
        }

        // AI move button (force AI to make a move)
        if (aiMoveBtn) {
            aiMoveBtn.addEventListener('click', function () {
                if (gameState.mode === 'pve' && gameState.currentPlayer === 'O' && !gameState.gameOver) {
                    makeAIMove();
                }
            });
        }

        // Game over modal buttons
        document.getElementById('playAgainBtn').addEventListener('click', function () {
            document.getElementById('gameOverModal').classList.remove('active');
            resetGame();
        });

        document.getElementById('goHomeBtn').addEventListener('click', function () {
            window.location.href = 'index.html';
        });

        // Close modal buttons
        document.querySelectorAll('.btn-close-modal').forEach(btn => {
            btn.addEventListener('click', function () {
                this.closest('.modal').classList.remove('active');
            });
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function (event) {
                if (event.target === this) {
                    this.classList.remove('active');
                }
            });
        });
    }

    // Show a hint for the human player
    function showHint() {
        // Get all possible moves for human (X)
        const possibleMoves = [];

        // Determine which boards are allowed
        let allowedBoards = [];
        if (gameState.nextBoard === -1) {
            // Any board that is not won and not full
            for (let i = 0; i < 9; i++) {
                if (gameState.smallBoardStatus[i] === '' && !isBoardFull(i)) {
                    allowedBoards.push(i);
                }
            }
        } else {
            // Only the specified board, if it's not won and not full
            if (gameState.smallBoardStatus[gameState.nextBoard] === '' && !isBoardFull(gameState.nextBoard)) {
                allowedBoards.push(gameState.nextBoard);
            } else {
                // If the specified board is won or full, any board is allowed
                for (let i = 0; i < 9; i++) {
                    if (gameState.smallBoardStatus[i] === '' && !isBoardFull(i)) {
                        allowedBoards.push(i);
                    }
                }
            }
        }

        // Get all empty cells in allowed boards
        for (const boardIndex of allowedBoards) {
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                if (gameState.boards[boardIndex][cellIndex] === '') {
                    possibleMoves.push({ boardIndex, cellIndex });
                }
            }
        }

        if (possibleMoves.length === 0) return;

        // Pick a random move to highlight as hint
        const hintMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        const cell = document.querySelector(`.cell-game[data-board-index="${hintMove.boardIndex}"][data-cell-index="${hintMove.cellIndex}"]`);

        // Highlight the cell
        cell.classList.add('winning-cell');

        // Remove highlight after 2 seconds
        setTimeout(() => {
            cell.classList.remove('winning-cell');
        }, 2000);
    }

    // Show game settings modal
    function showGameSettingsModal() {
        const modal = document.getElementById('gameSettingsModal');

        // Load current settings
        document.getElementById('gamePlayer1Name').value = playerXName.textContent;
        document.getElementById('gamePlayer2Name').value = playerOName.textContent;
        document.getElementById('gameAiName').value = settings.aiName || 'AI Agent';

        // Set difficulty
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === (settings.aiDifficulty || 'medium')) {
                btn.classList.add('active');
            }
        });

        // Set display options
        document.getElementById('gameHighlightMoves').checked = gameState.highlightMoves;
        document.getElementById('gameShowHints').checked = gameState.showHints;
        document.getElementById('gameAnimations').checked = gameState.animations;

        // Show/hide AI name based on mode
        const aiNameGroup = document.getElementById('gameAiNameGroup');
        if (gameState.mode === 'pve') {
            aiNameGroup.style.display = 'block';
        } else {
            aiNameGroup.style.display = 'none';
        }

        // Show modal
        modal.classList.add('active');

        // Setup event listeners for modal buttons
        document.getElementById('saveGameSettings').onclick = function () {
            saveGameSettings();
            modal.classList.remove('active');
        };

        document.getElementById('cancelGameSettings').onclick = function () {
            modal.classList.remove('active');
        };

        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Save game settings
    function saveGameSettings() {
        // Update player names
        playerXName.textContent = document.getElementById('gamePlayer1Name').value;
        playerOName.textContent = gameState.mode === 'pve' ?
            document.getElementById('gameAiName').value :
            document.getElementById('gamePlayer2Name').value;

        // Update settings
        settings.player1Name = playerXName.textContent;

        if (gameState.mode === 'pve') {
            settings.aiName = document.getElementById('gameAiName').value;
            playerOName.textContent = settings.aiName;
        } else {
            settings.player2Name = document.getElementById('gamePlayer2Name').value;
            playerOName.textContent = settings.player2Name;
        }

        settings.aiDifficulty = document.querySelector('.difficulty-btn.active').dataset.level;
        aiDifficulty.textContent = settings.aiDifficulty.charAt(0).toUpperCase() + settings.aiDifficulty.slice(1);

        // Update game state
        gameState.highlightMoves = document.getElementById('gameHighlightMoves').checked;
        gameState.showHints = document.getElementById('gameShowHints').checked;
        gameState.animations = document.getElementById('gameAnimations').checked;

        // Update board highlights
        updateBoardHighlights();

        // Save to localStorage
        localStorage.setItem('ultimateTicTacToeSettings', JSON.stringify(settings));

        // Show notification
        showNotification('Game settings updated!', 'success');
    }

    // Reset game
    function resetGame() {
        // Reset game state
        gameState.currentPlayer = 'X';
        gameState.nextBoard = -1;
        gameState.boards = Array(9).fill().map(() => Array(9).fill(''));
        gameState.smallBoardStatus = Array(9).fill('');
        gameState.gameOver = false;
        gameState.winner = '';
        gameState.moveCount = 0;
        gameState.aiThinking = false;

        // Clear move history
        gameState.moveHistory = [];
        updateMoveHistory();

        // Reset timer
        startTimer();
        updateMoveCount();

        // Recreate board
        createUltimateBoard();

        // Update UI
        updateGameInfo();
        updateWonBoards();
    }

    // Show notification
    function showNotification(message, type) {
        // Similar to the one in main.js
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            background-color: ${type === 'success' ? '#00b09b' : type === 'error' ? '#ff416c' : '#2575fc'};
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initialize the game
    initGame();
});