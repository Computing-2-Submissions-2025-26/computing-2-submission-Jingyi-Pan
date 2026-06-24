import assert from "assert";

import {
    getBoardSize,
    getBoard,
    getCurrentPlayer,
    getScores,
    getRemoveMode,
    getSkillsUsed,
    getPlayerName,
    placeMove,
    startRemoveSkill,
    removeOpponentPiece,
    restartGameData,
    resetGameDataForTest,
    isDraw
} from "../game-logic.js";

/**
 * Counts how many cells on the board contain a given value.
 * @param {string[][]} board Board to count cells on.
 * @param {string} value Cell value to count.
 * @returns {number} Number of matching cells.
 */
const count_cells = function (board, value) {
    let count = 0;
    board.forEach(function (row) {
        row.forEach(function (cell) {
            if (cell === value) {
                count += 1;
            }
        });
    });
    return count;
};

/**
 * Fills every empty cell on the board with the given value.
 * Obstacles are left unchanged.
 * @param {string[][]} board Board to fill.
 * @param {string} value Value used to fill empty cells.
 * @returns {void}
 */
const fill_empty_cells = function (board, value) {
    for (let row = 0; row < 15; row += 1) {
        for (let col = 0; col < 15; col += 1) {
            if (board[row][col] === "") {
                board[row][col] = value;
            }
        }
    }
};

describe("Gomoku Game Logic", function () {

    beforeEach(function () {
        resetGameDataForTest();
    });

    describe("Board initialisation", function () {

        it("should create a 15 by 15 board with obstacles", function () {
            const board = getBoard();
            assert.equal(getBoardSize(), 15);
            assert.equal(board.length, 15);
            assert.equal(board[0].length, 15);
            assert.equal(count_cells(board, "obstacle"), 15);
        });

        it("should start with penguin", function () {
            assert.equal(getCurrentPlayer(), "penguin");
            assert.equal(getPlayerName("penguin"), "Penguin");
            assert.equal(getPlayerName("seagull"), "Seagull");
        });

    });

    describe("Move pieces", function () {

        it("should place a piece and switch player", function () {
            const board = getBoard();
            const result = placeMove(1, 0);
            assert.equal(result.success, true);
            assert.equal(result.type, "normal");
            assert.equal(board[1][0], "penguin");
            assert.equal(getCurrentPlayer(), "seagull");
        });

        it("should reject occupied and rock cells", function () {
            const board = getBoard();
            placeMove(1, 0);
            const occupied = placeMove(1, 0);
            const obstacleCol = board[0].indexOf("obstacle");
            const obstacle = placeMove(0, obstacleCol);
            assert.equal(occupied.success, false);
            assert.equal(obstacle.success, false);
            assert.equal(board[1][0], "penguin");
            assert.equal(board[0][obstacleCol], "obstacle");
        });

        it("should reject moves after game over", function () {
            const board = getBoard();
            board[1][0] = "penguin";
            board[1][1] = "penguin";
            board[1][2] = "penguin";
            board[1][3] = "penguin";
            placeMove(1, 4);
            const result = placeMove(2, 0);
            assert.equal(result.success, false);
        });

    });

    describe("Winning conditions", function () {

        it("should detect a horizontal win and update scores", function () {
            const board = getBoard();
            const oldPenguinWin = getScores().penguin.win;
            const oldSeagullLoss = getScores().seagull.loss;
            board[1][0] = "penguin";
            board[1][1] = "penguin";
            board[1][2] = "penguin";
            board[1][3] = "penguin";
            const result = placeMove(1, 4);
            assert.equal(result.type, "win");
            assert.equal(result.player, "penguin");
            assert.equal(result.winningCells.length, 5);
            assert.equal(getScores().penguin.win, oldPenguinWin + 1);
            assert.equal(getScores().seagull.loss, oldSeagullLoss + 1);
        });

        it("should detect a vertical win", function () {
            const board = getBoard();
            board[0][0] = "penguin";
            board[1][0] = "penguin";
            board[2][0] = "penguin";
            board[3][0] = "penguin";
            const result = placeMove(4, 0);
            assert.equal(result.type, "win");
            assert.equal(result.winningCells.length, 5);
        });

        it("should detect a top-left diagonal win", function () {
            const board = getBoard();
            board[5][0] = "penguin";
            board[6][1] = "penguin";
            board[7][2] = "penguin";
            board[8][3] = "penguin";
            const result = placeMove(9, 4);
            assert.equal(result.type, "win");
            assert.equal(result.winningCells.length, 5);
        });

        it("should detect a bottom-left diagonal win", function () {
            const board = getBoard();
            board[5][4] = "penguin";
            board[6][3] = "penguin";
            board[7][2] = "penguin";
            board[8][1] = "penguin";
            const result = placeMove(9, 0);
            assert.equal(result.type, "win");
            assert.equal(result.winningCells.length, 5);
        });

        it("should not count four pieces as a win", function () {
            const board = getBoard();
            board[1][0] = "penguin";
            board[1][1] = "penguin";
            board[1][2] = "penguin";
            const result = placeMove(1, 3);

            assert.equal(result.success, true);
            assert.equal(result.type, "normal");
        });

        it("should detect a seagull win", function () {
            const board = getBoard();
            placeMove(1, 0);
            board[2][0] = "seagull";
            board[2][1] = "seagull";
            board[2][2] = "seagull";
            board[2][3] = "seagull";
            const result = placeMove(2, 4);
            assert.equal(result.type, "win");
            assert.equal(result.player, "seagull");
        });

    });
    /**
     * Draw detection is tested independently.
     * The helper function isDraw() is responsible only for determining whether
     * the board contains any remaining empty cells. Testing it directly avoids
     * constructing an unnecessarily large full-board scenario while still
     * verifying the intended behaviour of the function.
     */
    describe("Draw detection", function () {

        it("should return false when the board is not full", function () {
            assert.equal(isDraw(), false);
        });

        it("should return true when the board is full", function () {
            const board = getBoard();
            fill_empty_cells(board, "penguin");
            assert.equal(isDraw(), true);
        });

    });

    describe("Remove skill", function () {

        it("should remove an opponent piece", function () {
            const board = getBoard();
            board[1][0] = "seagull";
            const startResult = startRemoveSkill();
            const removeResult = removeOpponentPiece(1, 0);
            assert.equal(startResult.success, true);
            assert.equal(removeResult.success, true);
            assert.equal(board[1][0], "");
            assert.equal(getSkillsUsed().penguin.remove, true);
            assert.equal(getRemoveMode(), false);
        });

        it("should reject invalid remove skill uses", function () {
            const board = getBoard();
            board[1][0] = "penguin";
            board[1][1] = "seagull";
            const ownPieceResult = removeOpponentPiece(1, 0);
            startRemoveSkill();
            removeOpponentPiece(1, 1);
            const secondStartResult = startRemoveSkill();
            assert.equal(ownPieceResult.success, false);
            assert.equal(board[1][0], "penguin");
            assert.equal(secondStartResult.success, false);
        });

        it("should not switch player after removing a piece", function () {
            const board = getBoard();
            board[1][0] = "seagull";
            startRemoveSkill();
            removeOpponentPiece(1, 0);
            assert.equal(getCurrentPlayer(), "penguin");
        });

        it("should reject remove skill after game over", function () {
            const board = getBoard();
            board[1][0] = "penguin";
            board[1][1] = "penguin";
            board[1][2] = "penguin";
            board[1][3] = "penguin";
            placeMove(1, 4);
            const result = startRemoveSkill();
            assert.equal(result.success, false);
        });

    });

    describe("Restart game", function () {

        it("should reset game state after restart", function () {
            const board = getBoard();
            board[1][0] = "seagull";
            startRemoveSkill();
            removeOpponentPiece(1, 0);
            restartGameData();
            assert.equal(getRemoveMode(), false);
            assert.equal(getSkillsUsed().penguin.remove, false);
            assert.equal(getSkillsUsed().seagull.remove, false);
            assert.equal(getCurrentPlayer(), "seagull");
            assert.equal(count_cells(getBoard(), "penguin"), 0);
            assert.equal(count_cells(getBoard(), "seagull"), 0);
        });

    });

});