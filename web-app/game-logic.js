const boardSize = 15;

let board = [];
let startingPlayer = "penguin";
let currentPlayer = startingPlayer;
let gameOver = false;
let removeMode = false;
let layoutIndex = 0;

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

function getPlayerName(player) {
    if (player === "penguin") {
        return "Penguin";
    }

    return "Seagull";
}

function getOpponent(player) {
    if (player === "penguin") {
        return "seagull";
    }

    return "penguin";
}

function createBoardData() {
    board = [];
    removeMode = false;

    const currentLayout = obstacleLayouts[layoutIndex];

    for (let row = 0; row < boardSize; row += 1) {
        const rowData = [];

        for (let col = 0; col < boardSize; col += 1) {
            if (col === currentLayout[row]) {
                rowData.push("obstacle");
            } else {
                rowData.push("");
            }
        }

        board.push(rowData);
    }
}

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

function switchPlayer() {
    removeMode = false;

    if (currentPlayer === "penguin") {
        currentPlayer = "seagull";
    } else {
        currentPlayer = "penguin";
    }
}

function startRemoveSkill() {
    if (gameOver || skillsUsed[currentPlayer].remove) {
        return {
            success: false
        };
    }

    removeMode = true;

    return {
        success: true,
        message: `${getPlayerName(currentPlayer)}: choose one opponent piece to remove`
    };
}

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

function getWinningCells(row, col, player) {
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]
    ];

    for (const direction of directions) {
        const rowDirection = direction[0];
        const colDirection = direction[1];

        const cells = [
            ...collectCells(row, col, -rowDirection, -colDirection, player).reverse(),
            [row, col],
            ...collectCells(row, col, rowDirection, colDirection, player)
        ];

        if (cells.length >= 5) {
            return cells.slice(0, 5);
        }
    }

    return [];
}

function collectCells(row, col, rowDirection, colDirection, player) {
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
}

function isDraw() {
    for (let row = 0; row < boardSize; row += 1) {
        for (let col = 0; col < boardSize; col += 1) {
            if (board[row][col] === "") {
                return false;
            }
        }
    }

    return true;
}

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
    restartGameData
};