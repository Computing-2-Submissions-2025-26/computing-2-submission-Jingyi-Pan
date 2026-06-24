
/**
 * Gomoku game (Connect Five) logic module.
 * Handles board state and game rules.
 * @module GameLogic
 */

const boardSize = 15;

let board = [];
let startingPlayer = "penguin";
let currentPlayer = startingPlayer;
let gameOver = false;
let removeMode = false;
let layoutIndex = 0;
let switchPlayer;
let getWinningCells;
let collectCells;
let isDraw;

let scores = {
    penguin: {
        win: 0,
        loss: 0,
        draw: 0
    },
    seagull: {
        win: 0,
        loss: 0,
        draw: 0
    }
};

const obstacleLayouts = [
    [2, 5, 8, 11, 14, 1, 4, 7, 10, 13, 0, 3, 6, 9, 12],
    [7, 10, 13, 1, 4, 8, 11, 14, 2, 5, 9, 12, 0, 3, 6],
    [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11],
    [14, 11, 8, 5, 2, 13, 10, 7, 4, 1, 12, 9, 6, 3, 0],
    [3, 9, 0, 6, 12, 4, 10, 1, 7, 13, 5, 11, 2, 8, 14]
];

let skillsUsed = {
    penguin: {
        remove: false
    },
    seagull: {
        remove: false
    }
};


function getBoardSize() {
    return boardSize;
}

function getBoard() {
    return board;
}

function getCurrentPlayer() {
    return currentPlayer;
}

function getScores() {
    return scores;
}

function getRemoveMode() {
    return removeMode;
}

function getSkillsUsed() {
    return skillsUsed;
}


/**
 * @param {string} player The current player name
 * @returns {string} The formatted player name
 */
function getPlayerName(player) {
    if (player === "penguin") {
        return "Penguin";
    }

    return "Seagull";
}

/**
 * @param {string} player The current player name
 * @returns string The opposite player name
 */
function getOpponent(player) {
    if (player === "penguin") {
        return "seagull";
    }

    return "penguin";
}

/**
 * Creates a new 15×15 game board and places obstacles according
 * to the current obstacle layout.
 * Resets remove mode at the start of a new game.
 * @returns {void}
 */
function createBoardData() {
    board = [];
    removeMode = false;

    const currentLayout = obstacleLayouts[layoutIndex];

    let row = 0;

    while (row < boardSize) {
        const rowData = [];
        let col = 0;
        while (col < boardSize) {
            if (col === currentLayout[row]) {
                rowData.push("obstacle");
            } else {
                rowData.push("");
            }
            col += 1;
        }
        board.push(rowData);
        row += 1;
    }
}

/**
 * Collect connected player pieces in one direction.
 * 1. Starts from the current piece position
 * 2. Moves step-by-step in the given direction
 * 3. Collects all connected pieces belonging to the same player
 * 4. Stops when reaching the board boundary or a different piece
 * @param {number} row the row index of the current chess
 * @param {number} col the column index of the current chess
 * @param {number} rowDirection 1/-1/0, indicating the row moving direction
 * @param {number} colDirection 1/-1/0, indicatin the column moving direction
 * @param {string} player the current player
 * @returns {number[][]} A list of connected cell positions
 */
collectCells = function collectCells(
    row,
    col,
    rowDirection,
    colDirection,
    player
) {
    const cells = [];

    let nextRow = row + rowDirection;
    let nextCol = col + colDirection;

    while (
        nextRow >= 0 &&
        nextRow < boardSize &&
        nextCol >= 0 &&
        nextCol < boardSize &&
        board[nextRow][nextCol] === player
    ) {
        cells.push([nextRow, nextCol]);

        nextRow += rowDirection;
        nextCol += colDirection;
    }

    return cells;
};


/**
 * search in four directions from the current cell
 * search for all the connected player cell in a array
 * !!! important
 * @param {number} row the row index of current chess
 * @param {number} col the column index of current chess
 * @param {string} player the current player
 * @returns {number[][]} the list of winning cell position
 */
getWinningCells = function getWinningCells(row, col, player) {
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]
    ];

    let index = 0;

    while (index < directions.length) {
        let direction = directions[index];
        let rowDirection = direction[0];
        let colDirection = direction[1];

        let cells = [
            ...collectCells(
                row,
                col,
                -rowDirection,
                -colDirection,
                player
            ).reverse(),
            [row, col],
            ...collectCells(
                row,
                col,
                rowDirection,
                colDirection,
                player
            )
        ];


        if (cells.length >= 5) {
            return cells.slice(0, 6);
        }

        index += 1;
    }

    return [];
};


/**
 * Checks whether the game board is full.
 * @returns {boolean} True if there are no empty cells remaining.
 */
isDraw = function isDraw() {
    let row = 0;

    while (row < boardSize) {
        let col = 0;

        while (col < boardSize) {
            if (board[row][col] === "") {
                return false;
            }

            col += 1;
        }

        row += 1;
    }

    return true;
};


/**
 * Places the current player's piece on the board.
 * Checks whether the move creates a win or a draw, then updates
 * the game state and score if needed.
 * @param {number} row The row index of the selected cell.
 * @param {number} col The column index of the selected cell.
 * @returns {object} The result of the move.
 */
function placeMove(row, col) {
    if (gameOver) {
        return {
            success: false
        };
    }

    if (board[row][col] !== "") {
        return {
            success: false
        };
    }

    board[row][col] = currentPlayer;

    const winningCells = getWinningCells(row, col, currentPlayer);

    if (winningCells.length >= 5) {
        gameOver = true;

        scores[currentPlayer].win += 1;
        scores[getOpponent(currentPlayer)].loss += 1;

        return {
            success: true,
            type: "win",
            player: currentPlayer,
            winningCells: winningCells,
            message: `${getPlayerName(currentPlayer)} wins!`
        };
    }

    if (isDraw()) {
        gameOver = true;

        scores.penguin.draw += 1;
        scores.seagull.draw += 1;

        return {
            success: true,
            type: "draw",
            message: "Draw!"
        };
    }

    switchPlayer();

    return {
        success: true,
        type: "normal",
        message: `${getPlayerName(currentPlayer)}'s turn`
    };
}

/**
 * switch player
 * update the player's highlight image
 * update the text on the webpage
 */
switchPlayer = function switchPlayer() {
    removeMode = false;

    if (currentPlayer === "penguin") {
        currentPlayer = "seagull";
    } else {
        currentPlayer = "penguin";
    }
};

/**
 * Starts the remove skill for the current player.
 * @returns {object} The result of the operation.
 */
function startRemoveSkill() {
    if (gameOver || skillsUsed[currentPlayer].remove) {
        return {
            success: false
        };
    }

    removeMode = true;

    return {
        success: true,
        message: `${getPlayerName(currentPlayer)}: choose one opponent piece`
    };
}

/**
 * the skill to remove oppoents piece
 * check if the clicked chess is the opponents' cell
 * remove the chess in the cell
 * update status
 */
function removeOpponentPiece(row, col) {
    const opponent = getOpponent(currentPlayer);

    if (board[row][col] !== opponent) {
        return {
            success: false,
            message: "You can only remove opponent's piece"
        };
    }

    board[row][col] = "";
    skillsUsed[currentPlayer].remove = true;
    removeMode = false;

    return {
        success: true,
        message: `${getPlayerName(currentPlayer)} removed one opponent piece`
    };
}

/**
 * Restart the game and reset all game states.
 * 1. Switches to the next obstacle layout
 * 2. Alternates the starting player
 * 3. Resets game status variables
 * 4. Resets player skill usage
 * 5. Updates the game status text
 * 6. Hides and clears the win video popup
 * 7. Recreates the board
 * 8. Updates the active player highlight
 * @returns {void}
 */
function restartGameData() {
    layoutIndex += 1;

    if (layoutIndex >= obstacleLayouts.length) {
        layoutIndex = 0;
    }

    if (startingPlayer === "penguin") {
        startingPlayer = "seagull";
    } else {
        startingPlayer = "penguin";
    }

    currentPlayer = startingPlayer;
    gameOver = false;
    removeMode = false;

    skillsUsed = {
        penguin: {
            remove: false
        },
        seagull: {
            remove: false
        }
    };

    createBoardData();

    return {
        message: `${getPlayerName(currentPlayer)}'s turn`
    };
}

function resetGameDataForTest() {
    board = [];
    startingPlayer = "penguin";
    currentPlayer = "penguin";
    gameOver = false;
    removeMode = false;
    layoutIndex = 0;

    skillsUsed = {
        penguin: {
            remove: false
        },
        seagull: {
            remove: false
        }
    };

    scores = {
        penguin: {
            win: 0,
            loss: 0,
            draw: 0
        },
        seagull: {
            win: 0,
            loss: 0,
            draw: 0
        }
    };

    createBoardData();
}

export {
    getBoardSize,
    getBoard,
    getCurrentPlayer,
    getScores,
    getRemoveMode,
    getSkillsUsed,
    getPlayerName,
    createBoardData,
    placeMove,
    startRemoveSkill,
    removeOpponentPiece,
    restartGameData,
    resetGameDataForTest,
    isDraw
};