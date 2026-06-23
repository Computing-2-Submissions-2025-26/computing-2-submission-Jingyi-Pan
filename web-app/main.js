import {
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
} from "./game-logic.js";

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const restartButton = document.getElementById("restart-button");
const removeButton = document.getElementById("remove-button");

const videoPopupScreen = document.getElementById("video-popup-screen");
const closeVideoButton = document.getElementById("close-video-button");
const winVideo = document.getElementById("win-video");

const penguinPlayer = document.getElementById("penguin-player");
const seagullPlayer = document.getElementById("seagull-player");

const penguinWinElement = document.getElementById("penguin-win");
const penguinLossElement = document.getElementById("penguin-loss");
const penguinDrawElement = document.getElementById("penguin-draw");

const seagullWinElement = document.getElementById("seagull-win");
const seagullLossElement = document.getElementById("seagull-loss");
const seagullDrawElement = document.getElementById("seagull-draw");

let cursorRow = 0;
let cursorCol = 0;

function renderBoard() {
    boardElement.innerHTML = "";

    const boardSize = getBoardSize();
    const board = getBoard();

    for (let row = 0; row < boardSize; row += 1) {
        const tableRow = document.createElement("tr");

        for (let col = 0; col < boardSize; col += 1) {
            const cell = document.createElement("td");

            cell.dataset.row = row;
            cell.dataset.col = col;

            cell.setAttribute("tabindex", "0");
            cell.addEventListener("keydown", handleCellKeydown);

            if (board[row][col] === "obstacle") {
                cell.classList.add("obstacle");
            }

            cell.addEventListener("click", handleCellClick);
            tableRow.appendChild(cell);
        }

        boardElement.appendChild(tableRow);
    }
}

function handleCellClick(event) {
    const cell = event.currentTarget;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    const board = getBoard();

    if (board[row][col] === "obstacle") {
        return;
    }

    if (getRemoveMode()) {
        const result = removeOpponentPiece(row, col);

        statusElement.textContent = result.message;

        if (result.success) {
            cell.innerHTML = "";
        }

        updateSkillButtons();
        return;
    }

    if (board[row][col] !== "") {
        return;
    }

    const player = getCurrentPlayer();

    const result = placeMove(row, col);

    if (!result.success) {
        return;
    }

    placePiece(cell, player);

    statusElement.textContent = result.message;

    if (result.type === "win") {
        showWinningCells(result.winningCells);
        updateScoreDisplay();

        setTimeout(function () {
            playWinVideo(result.player);
        }, 600);

        return;
    }

    if (result.type === "draw") {
        updateScoreDisplay();

        setTimeout(function () {
            playWinVideo("draw");
        }, 600);

        return;
    }

    updateActivePlayerImage();
    updateSkillButtons();
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

function updateActivePlayerImage() {
    const currentPlayer = getCurrentPlayer();

    if (currentPlayer === "penguin") {
        penguinPlayer.classList.add("active-player");
        seagullPlayer.classList.remove("active-player");
    } else {
        seagullPlayer.classList.add("active-player");
        penguinPlayer.classList.remove("active-player");
    }

    updateSkillButtons();
}

function updateSkillButtons() {
    const currentPlayer = getCurrentPlayer();
    const skillsUsed = getSkillsUsed();

    removeButton.disabled = skillsUsed[currentPlayer].remove;
}

function handleRemoveButtonClick() {
    const result = startRemoveSkill();

    if (!result.success) {
        return;
    }

    statusElement.textContent = result.message;
    updateSkillButtons();
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
    } else if (winner === "seagull") {
        winVideo.src = "seagull-win.mp4";
    } else {
        winVideo.src = "draw-video.mp4";
    }

    winVideo.volume = 0.4;
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
    const result = restartGameData();

    statusElement.textContent = result.message;

    videoPopupScreen.classList.add("hidden");
    winVideo.pause();
    winVideo.src = "";

    renderBoard();
    updateActivePlayerImage();
    updateScoreDisplay();
}

function updateScoreDisplay() {
    const scores = getScores();

    penguinWinElement.textContent = scores.penguin.win;
    penguinLossElement.textContent = scores.penguin.loss;
    penguinDrawElement.textContent = scores.penguin.draw;

    seagullWinElement.textContent = scores.seagull.win;
    seagullLossElement.textContent = scores.seagull.loss;
    seagullDrawElement.textContent = scores.seagull.draw;
}

function handleCellKeydown(event) {
    const cell = event.currentTarget;

    cursorRow = Number(cell.dataset.row);
    cursorCol = Number(cell.dataset.col);

    if (event.key === "ArrowUp") {
        event.preventDefault();
        moveCursor(-1, 0);
    } else if (event.key === "ArrowDown") {
        event.preventDefault();
        moveCursor(1, 0);
    } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveCursor(0, -1);
    } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveCursor(0, 1);
    } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        cell.click();
    }
}

function moveCursor(rowChange, colChange) {
    const boardSize = getBoardSize();

    cursorRow += rowChange;
    cursorCol += colChange;

    if (cursorRow < 0) {
        cursorRow = 0;
    }

    if (cursorRow >= boardSize) {
        cursorRow = boardSize - 1;
    }

    if (cursorCol < 0) {
        cursorCol = 0;
    }

    if (cursorCol >= boardSize) {
        cursorCol = boardSize - 1;
    }

    const nextCell = document.querySelector(
        `td[data-row="${cursorRow}"][data-col="${cursorCol}"]`
    );

    if (nextCell !== null) {
        nextCell.focus();
    }
}

document.addEventListener("click", function () {
    const bgm = document.getElementById("bgm");
    bgm.play();
}, { once: true });

restartButton.addEventListener("click", restartGame);
closeVideoButton.addEventListener("click", closeWinVideo);
removeButton.addEventListener("click", handleRemoveButtonClick);

createBoardData();
renderBoard();
updateActivePlayerImage();
updateScoreDisplay();

const firstCell = document.querySelector('td[data-row="0"][data-col="0"]');

if (firstCell !== null) {
    firstCell.focus();
}