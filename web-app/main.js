import {
    getBoardSize,
    getBoard,
    getCurrentPlayer,
    getScores,
    getRemoveMode,
    getSkillsUsed,
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
let renderBoard;
let handleCellClick;
let placePiece;
let updateActivePlayerImage;
let updateSkillButtons;
let handleRemoveButtonClick;
let showWinningCells;
let playWinVideo;
let closeWinVideo;
let restartGame;
let updateScoreDisplay;
let handleCellKeydown;
let moveCursor;

/**
 * Renders the game board in the browser.
 * Creates all board cells, applies rocks in the board,
 * and attaches keyboard and mouse event handlers.
 * @returns {void}
 */
renderBoard = function renderBoard() {
    boardElement.innerHTML = "";

    const boardSize = getBoardSize();
    const board = getBoard();

    let row = 0;

    while (row < boardSize) {
        const tableRow = document.createElement("tr");

        let col = 0;

        while (col < boardSize) {
            const cell = document.createElement("td");

            cell.dataset.row = row;
            cell.dataset.col = col;

            cell.setAttribute("tabindex", "0");
            cell.setAttribute("role", "button");
            cell.setAttribute(
                "aria-label",
                `Row ${row + 1}, column ${col + 1}`
            );
            cell.addEventListener("keydown", handleCellKeydown);

            if (board[row][col] === "obstacle") {
                cell.classList.add("obstacle");
            }

            cell.addEventListener("click", handleCellClick);
            tableRow.appendChild(cell);

            col += 1;
        }

        boardElement.appendChild(tableRow);

        row += 1;
    }
};

/**
* This is the function to respond users click to the cell
 * 1. chech the game is over
 * 2. get the position of the clicked cell
 * 3. if in remove mode, move
 * 4. if not in remove mode, check if the cell is empty
 * 5. if is empty, place the current player's piece
 * 6. check winning condition
 * 7. end the game if win and give highlight and aninmation
 * 8. switch player
 * @param {MouseEvent} event The click event from the selected cell
 * @returns {void}
 */
handleCellClick = function handleCellClick(event) {
    const cell = event.currentTarget;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    const board = getBoard();

    if (board[row][col] === "obstacle") {
        return;
    }

    if (getRemoveMode()) {
        const removeResult = removeOpponentPiece(row, col);

        statusElement.textContent = removeResult.message;

        if (removeResult.success) {
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
};

/**
 * Place the penguin/seagual chess image when player placed them in a cell
 * @param {HTMLElement} cell The user selected cell
 * @param {string} player THe current player placing the piece
 */
placePiece = function placePiece(cell, player) {
    const piece = document.createElement("img");

    piece.classList.add("piece");

    if (player === "penguin") {
        piece.src = "assets/penguin.jpg";
        piece.alt = "Penguin";
    } else {
        piece.src = "assets/seagull.jpg";
        piece.alt = "Seagull";
    }

    piece.draggable = false;
    cell.appendChild(piece);
};

/**
 * Update current player, show who's turn now
 * Adds the "active-player" class to the current player's image and removes it
 * from the other player's image
 * '.active-palyer' is to make the image jump, be bigger, and highlight
 */
updateActivePlayerImage = function updateActivePlayerImage() {
    const currentPlayer = getCurrentPlayer();

    if (currentPlayer === "penguin") {
        penguinPlayer.classList.add("active-player");
        seagullPlayer.classList.remove("active-player");
    } else {
        seagullPlayer.classList.add("active-player");
        penguinPlayer.classList.remove("active-player");
    }

    updateSkillButtons();
};

/**
 * check if the skill button has already used once by the user
 */
updateSkillButtons = function updateSkillButtons() {
    const currentPlayer = getCurrentPlayer();
    const skillsUsed = getSkillsUsed();

    removeButton.disabled = skillsUsed[currentPlayer].remove;
};

/**
 * Activates the remove-piece skill for the current player.
 * Updates the status message and skill button state if the
 * skill is successfully activated.
 * @returns {void}
 */
handleRemoveButtonClick = function handleRemoveButtonClick() {
    const result = startRemoveSkill();

    if (!result.success) {
        return;
    }

    statusElement.textContent = result.message;
    updateSkillButtons();
};

/**
 * Highlight all winning pieces on the board.
 * 1. Loops through all winning cell positions
 * 2. Finds the matching HTML board cells
 * 3. Finds the piece image inside each cell
 * 4. Adds the winning-piece CSS class for animation effects
 * @param {*} winningCells
 */
showWinningCells = function showWinningCells(winningCells) {
    let index = 0;

    while (index < winningCells.length) {
        const cellPosition = winningCells[index];
        const row = cellPosition[0];
        const col = cellPosition[1];

        const cell = document.querySelector(
            `td[data-row="${row}"][data-col="${col}"]`
        );

        const piece = cell.querySelector(".piece");

        if (piece !== null) {
            piece.classList.add("winning-piece");
        }

        index += 1;
    }
};

/**
* play different video when different player wins
* @param {string} winner winning player anme
*/
playWinVideo = function playWinVideo(winner) {
    videoPopupScreen.classList.remove("hidden");

    if (winner === "penguin") {
        winVideo.src = "assets/penguin-win.mp4";
    } else if (winner === "seagull") {
        winVideo.src = "assets/seagull-win.mp4";
    } else {
        winVideo.src = "assets/draw-video.mp4";
    }

    winVideo.volume = 0.4;
    winVideo.currentTime = 0;
    winVideo.play();
};

/**
 * close the winning pop up window and restart
 */
closeWinVideo = function closeWinVideo() {
    winVideo.pause();
    winVideo.src = "";

    videoPopupScreen.classList.add("hidden");

    restartGame();
};

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
restartGame = function restartGame() {
    const result = restartGameData();

    statusElement.textContent = result.message;

    videoPopupScreen.classList.add("hidden");
    winVideo.pause();
    winVideo.src = "";

    renderBoard();
    updateActivePlayerImage();
    updateScoreDisplay();
};

/**
 * Update the score display for both players.
*/
updateScoreDisplay = function updateScoreDisplay() {
    const scores = getScores();

    penguinWinElement.textContent = scores.penguin.win;
    penguinLossElement.textContent = scores.penguin.loss;
    penguinDrawElement.textContent = scores.penguin.draw;

    seagullWinElement.textContent = scores.seagull.win;
    seagullLossElement.textContent = scores.seagull.loss;
    seagullDrawElement.textContent = scores.seagull.draw;
};

/**
 * Handles keyboard input for board navigation.
 * Allows the player to move the cursor using the
 * arrow keys and select a cell using Enter or Space.
 * @param {KeyboardEvent} event The keyboard event.
 * @returns {void}
 */
handleCellKeydown = function handleCellKeydown(event) {
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
};

/**
 * Moves the keyboard cursor to a new board position.
 * Keeps the cursor within the board boundaries and
 * updates focus to the newly selected cell.
 * @param {number} rowChange The row offset to apply.
 * @param {number} colChange The column offset to apply.
 * @returns {void}
 */
moveCursor = function moveCursor(rowChange, colChange) {
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
};

document.addEventListener("click", function () {
    const bgm = document.getElementById("bgm");
    bgm.play();
}, {once: true});

restartButton.addEventListener("click", restartGame);
closeVideoButton.addEventListener("click", closeWinVideo);
removeButton.addEventListener("click", handleRemoveButtonClick);

createBoardData();
renderBoard();
updateActivePlayerImage();
updateScoreDisplay();

const firstCell = document.querySelector(
    "td[data-row=\"0\"][data-col=\"0\"]"
);

if (firstCell !== null) {
    firstCell.focus();
}