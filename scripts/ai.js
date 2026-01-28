// AI Logic for Ultimate Tic-Tac-Toe
// This file contains the Minimax algorithm with Alpha-Beta pruning

class UltimateTicTacToeAI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.maxDepth = this.getMaxDepth();
        this.nodesEvaluated = 0;
    }

    getMaxDepth() {
        switch (this.difficulty) {
            case 'easy': return 1; // Very shallow search
            case 'medium': return 3; // Moderate search
            case 'hard': return 5; // Deep search with pruning
            default: return 3;
        }
    }

    // Evaluate the current game state
    evaluateState(boards, smallBoardStatus, player) {
        let score = 0;
        const opponent = player === 'X' ? 'O' : 'X';

        // Evaluate small boards
        for (let i = 0; i < 9; i++) {
            if (smallBoardStatus[i] === player) {
                score += 100;
            } else if (smallBoardStatus[i] === opponent) {
                score -= 100;
            } else if (smallBoardStatus[i] === 'D') {
                // Draw boards are neutral
            } else {
                // Board is still in play, evaluate its potential
                const boardScore = this.evaluateSmallBoard(boards[i], player);
                score += boardScore;
            }
        }

        // Evaluate large board (winning condition)
        const largeBoardWinner = this.checkLargeBoardWinner(smallBoardStatus);
        if (largeBoardWinner === player) {
            score += 1000; // Winning the game is most important
        } else if (largeBoardWinner === opponent) {
            score -= 1000;
        }

        // Strategic advantage: control of center board
        if (smallBoardStatus[4] === player) {
            score += 50;
        } else if (smallBoardStatus[4] === opponent) {
            score -= 50;
        }

        // Strategic advantage: control of corner boards
        const corners = [0, 2, 6, 8];
        for (const corner of corners) {
            if (smallBoardStatus[corner] === player) {
                score += 30;
            } else if (smallBoardStatus[corner] === opponent) {
                score -= 30;
            }
        }

        return score;
    }

    // Evaluate a small board
    evaluateSmallBoard(board, player) {
        const opponent = player === 'X' ? 'O' : 'X';
        let score = 0;

        // Check for potential wins
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const line of lines) {
            const [a, b, c] = line;
            const values = [board[a], board[b], board[c]];

            const playerCount = values.filter(cell => cell === player).length;
            const opponentCount = values.filter(cell => cell === opponent).length;
            const emptyCount = values.filter(cell => cell === '').length;

            if (playerCount === 3) {
                score += 100;
            } else if (playerCount === 2 && emptyCount === 1) {
                score += 10; // Almost winning
            } else if (playerCount === 1 && emptyCount === 2) {
                score += 1; // Potential
            }

            if (opponentCount === 3) {
                score -= 100;
            } else if (opponentCount === 2 && emptyCount === 1) {
                score -= 10; // Block opponent
            } else if (opponentCount === 1 && emptyCount === 2) {
                score -= 1; // Opponent potential
            }
        }

        // Center control
        if (board[4] === player) {
            score += 5;
        } else if (board[4] === opponent) {
            score -= 5;
        }

        return score;
    }

    // Check if someone won the large board
    checkLargeBoardWinner(smallBoardStatus) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const line of lines) {
            const [a, b, c] = line;
            if (smallBoardStatus[a] !== '' && smallBoardStatus[a] !== 'D' &&
                smallBoardStatus[a] === smallBoardStatus[b] &&
                smallBoardStatus[a] === smallBoardStatus[c]) {
                return smallBoardStatus[a];
            }
        }

        // Check for draw
        if (smallBoardStatus.every(status => status !== '')) {
            return 'D';
        }

        return '';
    }

    // Check if a small board is won
    checkSmallBoardWinner(board) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const line of lines) {
            const [a, b, c] = line;
            if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }

        // Check for draw
        if (board.every(cell => cell !== '')) {
            return 'D';
        }

        return '';
    }

    // Get all possible moves
    getPossibleMoves(boards, smallBoardStatus, nextBoard) {
        const moves = [];

        // Determine which boards are allowed
        let allowedBoards = [];
        if (nextBoard === -1) {
            // Any board that is not won and not full
            for (let i = 0; i < 9; i++) {
                if (smallBoardStatus[i] === '' && !this.isBoardFull(boards[i])) {
                    allowedBoards.push(i);
                }
            }
        } else {
            // Only the specified board, if it's not won and not full
            if (smallBoardStatus[nextBoard] === '' && !this.isBoardFull(boards[nextBoard])) {
                allowedBoards.push(nextBoard);
            } else {
                // If the specified board is won or full, any board is allowed
                for (let i = 0; i < 9; i++) {
                    if (smallBoardStatus[i] === '' && !this.isBoardFull(boards[i])) {
                        allowedBoards.push(i);
                    }
                }
            }
        }

        // Get all empty cells in allowed boards
        for (const boardIndex of allowedBoards) {
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                if (boards[boardIndex][cellIndex] === '') {
                    moves.push({ boardIndex, cellIndex });
                }
            }
        }

        return moves;
    }

    // Check if a board is full
    isBoardFull(board) {
        return board.every(cell => cell !== '');
    }

    // Make a move on a copy of the game state
    makeMoveCopy(boards, smallBoardStatus, move, player) {
        // Deep copy the boards
        const newBoards = boards.map(board => [...board]);
        const newSmallBoardStatus = [...smallBoardStatus];

        // Apply the move
        newBoards[move.boardIndex][move.cellIndex] = player;

        // Check if this move wins the small board
        const smallBoardWinner = this.checkSmallBoardWinner(newBoards[move.boardIndex]);
        if (smallBoardWinner !== '') {
            newSmallBoardStatus[move.boardIndex] = smallBoardWinner;
        }

        // Determine next board
        let nextBoard = move.cellIndex;

        // Check if next board is valid (not won and not full)
        if (newSmallBoardStatus[nextBoard] === '' && !this.isBoardFull(newBoards[nextBoard])) {
            // nextBoard stays as move.cellIndex
        } else {
            nextBoard = -1; // Any board
        }

        return {
            boards: newBoards,
            smallBoardStatus: newSmallBoardStatus,
            nextBoard: nextBoard
        };
    }

    // Minimax algorithm with Alpha-Beta pruning
    minimax(boards, smallBoardStatus, nextBoard, depth, isMaximizing, alpha, beta, player) {
        this.nodesEvaluated++;

        const opponent = player === 'X' ? 'O' : 'X';
        const currentPlayer = isMaximizing ? player : opponent;

        // Check terminal conditions
        const largeBoardWinner = this.checkLargeBoardWinner(smallBoardStatus);
        if (largeBoardWinner !== '') {
            if (largeBoardWinner === player) {
                return { score: 1000 - depth, move: null }; // Win sooner is better
            } else if (largeBoardWinner === opponent) {
                return { score: -1000 + depth, move: null }; // Lose later is better
            } else {
                return { score: 0, move: null }; // Draw
            }
        }

        if (depth === 0) {
            const score = this.evaluateState(boards, smallBoardStatus, player);
            return { score, move: null };
        }

        const possibleMoves = this.getPossibleMoves(boards, smallBoardStatus, nextBoard);

        if (possibleMoves.length === 0) {
            const score = this.evaluateState(boards, smallBoardStatus, player);
            return { score, move: null };
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            let bestMove = possibleMoves[0];

            for (const move of possibleMoves) {
                const newState = this.makeMoveCopy(boards, smallBoardStatus, move, player);
                const result = this.minimax(
                    newState.boards,
                    newState.smallBoardStatus,
                    newState.nextBoard,
                    depth - 1,
                    false,
                    alpha,
                    beta,
                    player
                );

                if (result.score > bestScore) {
                    bestScore = result.score;
                    bestMove = move;
                }

                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) {
                    break; // Beta cutoff
                }
            }

            return { score: bestScore, move: bestMove };
        } else {
            let bestScore = Infinity;
            let bestMove = possibleMoves[0];

            for (const move of possibleMoves) {
                const newState = this.makeMoveCopy(boards, smallBoardStatus, move, opponent);
                const result = this.minimax(
                    newState.boards,
                    newState.smallBoardStatus,
                    newState.nextBoard,
                    depth - 1,
                    true,
                    alpha,
                    beta,
                    player
                );

                if (result.score < bestScore) {
                    bestScore = result.score;
                    bestMove = move;
                }

                beta = Math.min(beta, bestScore);
                if (beta <= alpha) {
                    break; // Alpha cutoff
                }
            }

            return { score: bestScore, move: bestMove };
        }
    }

    // Get the best move for the AI
    getBestMove(gameState) {
        this.nodesEvaluated = 0;

        // For easy difficulty, sometimes make a random move
        if (this.difficulty === 'easy' && Math.random() < 0.3) {
            const possibleMoves = this.getPossibleMoves(
                gameState.boards,
                gameState.smallBoardStatus,
                gameState.nextBoard
            );
            if (possibleMoves.length > 0) {
                return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
        }

        // Use Minimax for medium and hard difficulties
        const player = 'O'; // AI is always O in this implementation
        const result = this.minimax(
            gameState.boards,
            gameState.smallBoardStatus,
            gameState.nextBoard,
            this.maxDepth,
            true,
            -Infinity,
            Infinity,
            player
        );

        console.log(`AI evaluated ${this.nodesEvaluated} nodes, difficulty: ${this.difficulty}`);

        return result.move;
    }
}

// Export for use in game.js
// Note: In a real deployment, you'd use modules
// For simplicity, we'll attach to window
window.UltimateTicTacToeAI = UltimateTicTacToeAI;