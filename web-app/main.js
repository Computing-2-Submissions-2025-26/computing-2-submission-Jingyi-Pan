const boardSize = 15;

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const restartButton = document.getElementById("restart-button");

const videoPopupScreen = document.getElementById("video-popup-screen");
const closeVideoButton = document.getElementById("close-video-button");
const winVideo = document.getElementById("win-video");

const penguinPlayer = document.getElementById("penguin-player");
const seagullPlayer = document.getElementById("seagull-player");

let board = [];
let startingPlayer = "penguin";
let currentPlayer = startingPlayer;
let gameOver = false;

function updateActivePlayerImage() {
    if (currentPlayer === "penguin") {
        penguinPlayer.classList.add("active-player");
        seagullPlayer.classList.remove("active-player");
    } else {
        seagullPlayer.classList.add("active-player");
        penguinPlayer.classList.remove("active-player");
    }
}

function createBoard() {
    boardElement.innerHTML = "";
    board = [];

    for (let row = 0; row < boardSize; row += 1) {
        const rowData = [];
        const tableRow = document.createElement("tr");

        for (let col = 0; col < boardSize; col += 1) {
            rowData.push("");

            const cell = document.createElement("td");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", handleCellClick);

            tableRow.appendChild(cell);
        }

        board.push(rowData);
        boardElement.appendChild(tableRow);
    }
}

function handleCellClick(event) {
    if (gameOver) {
        return;
    }

    const cell = event.currentTarget;
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    if (board[row][col] !== "") {
        return;
    }

    board[row][col] = currentPlayer;
    placePiece(cell, currentPlayer);

    const winningCells = getWinningCells(row, col, currentPlayer);

    if (winningCells.length >= 5) {
        gameOver = true;
        showWinningCells(winningCells);

        if (currentPlayer === "penguin") {
            statusElement.textContent = "Penguin wins!";
        } else {
            statusElement.textContent = "Seagull wins!";
        }

        setTimeout(function () {
            playWinVideo(currentPlayer);
        }, 600);

        return;
    }

    switchPlayer();
}

function placePiece(cell, player) {
    const piece = document.createElement("img");
    piece.classList.add("piece");

    if (player === "penguin") {
        piece.src = "penguin.jpg";
        piece.alt = "Penguin";
    } else {
        piece.src = "seagull.jpg";
        piece.alt = "Seagull";
    }

    piece.draggable = false;
    cell.appendChild(piece);
}

function switchPlayer() {
    if (currentPlayer === "penguin") {
        currentPlayer = "seagull";
        statusElement.textContent = "Seagull's turn";
    } else {
        currentPlayer = "penguin";
        statusElement.textContent = "Penguin's turn";
    }

    updateActivePlayerImage();
}

function getPlayerName(player) {
    if (player === "penguin") {
        return "Penguin";
    }

    return "Seagull";
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

function showWinningCells(winningCells) {
    for (const cellPosition of winningCells) {
        const row = cellPosition[0];
        const col = cellPosition[1];

        const cell = document.querySelector(
            `td[data-row="${row}"][data-col="${col}"]`
        );

        const piece = cell.querySelector(".piece");

        if (piece !== null) {
            piece.classList.add("winning-piece");
        }
    }
}

function playWinVideo(winner) {
    videoPopupScreen.classList.remove("hidden");

    if (winner === "penguin") {
        winVideo.src = "penguin-win.mp4";
    } else {
        winVideo.src = "seagull-win.mp4";
    }

    winVideo.currentTime = 0;
    winVideo.play();
}

function closeWinVideo() {
    winVideo.pause();
    winVideo.src = "";

    videoPopupScreen.classList.add("hidden");

    restartGame();
}

function restartGame() {
    if (startingPlayer === "penguin") {
        startingPlayer = "seagull";
    } else {
        startingPlayer = "penguin";
    }

    currentPlayer = startingPlayer;
    gameOver = false;

    if (currentPlayer === "penguin") {
        statusElement.textContent = "Penguin's turn";
    } else {
        statusElement.textContent = "Seagull's turn";
    }

    videoPopupScreen.classList.add("hidden");
    winVideo.pause();
    winVideo.src = "";

    createBoard();
    updateActivePlayerImage();
}

document.addEventListener("click", function () {

    const bgm = document.getElementById("bgm");

    bgm.play();

}, { once: true });

restartButton.addEventListener("click", restartGame);
closeVideoButton.addEventListener("click", closeWinVideo);

createBoard();
updateActivePlayerImage();