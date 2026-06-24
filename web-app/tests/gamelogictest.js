import assert from "assert";

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
    restartGameData,
    resetGameDataForTest
} from "../game-logic.js";

describe("Gomoku Game Logic", function () {

    beforeEach(function () {
        resetGameDataForTest();
    });

    describe("Basic game data", function () {

        it("should return the correct board size", function () {
            assert.equal(getBoardSize(), 15);
        });

        it("should create a 15 by 15 board", function () {
            const board = getBoard();

            assert.equal(board.length, 15);
            assert.equal(board[0].length, 15);
        });

        it("should place one obstacle in each row", function () {
            const board = getBoard();

            let obstacleCount = 0;

            board.forEach(function (row) {
                row.forEach(function (cell) {
                    if (cell === "obstacle") {
                        obstacleCount += 1;
                    }
                });
            });

            assert.equal(obstacleCount, 15);
        });

        it("should start with penguin as the current player", function () {
            assert.equal(getCurrentPlayer(), "penguin");
        });

        it("should format penguin name correctly", function () {
            assert.equal(getPlayerName("penguin"), "Penguin");
        });

        it("should format seagull name correctly", function () {
            assert.equal(getPlayerName("seagull"), "Seagull");
        });

    });

    describe("placeMove", function () {

        it("should place the current player's piece on an empty cell", function () {
            const board = getBoard();

            const result = placeMove(1, 0);

            assert.equal(result.success, true);
            assert.equal(board[1][0], "penguin");
        });

        it("should switch player after a normal move", function () {
            const result = placeMove(1, 0);

            assert.equal(result.type, "normal");
            assert.equal(getCurrentPlayer(), "seagull");
        });

        it("should not allow placing a piece on an occupied cell", function () {
            const board = getBoard();

            placeMove(1, 0);
            const result = placeMove(1, 0);

            assert.equal(result.success, false);
            assert.equal(board[1][0], "penguin");
        });

        it("should not allow placing a piece on an obstacle", function () {
            const board = getBoard();

            const row = 0;
            const col = board[0].indexOf("obstacle");

            const result = placeMove(row, col);

            assert.equal(result.success, false);
            assert.equal(board[row][col], "obstacle");
        });

    });

    describe("Winning condition", function () {

        it("should detect a horizontal win", function () {
            const board = getBoard();

            board[1][0] = "penguin";
            board[1][1] = "penguin";
            board[1][2] = "penguin";
            board[1][3] = "penguin";
            board[1][4] = "";

            const result = placeMove(1, 4);

            assert.equal(result.success, true);
            assert.equal(result.type, "win");
            assert.equal(result.player, "penguin");
            assert.equal(result.winningCells.length, 5);
        });

        it("should detect a vertical win", function () {
            const board = getBoard();

            board[0][0] = "penguin";
            board[1][0] = "penguin";
            board[2][0] = "penguin";
            board[3][0] = "penguin";
            board[4][0] = "";

            const result = placeMove(4, 0);

            assert.equal(result.success, true);
            assert.equal(result.type, "win");
            assert.equal(result.player, "penguin");
            assert.equal(result.winningCells.length, 5);
        });

        it("should detect a diagonal win from top-left to bottom-right", function () {
            const board = getBoard();

            board[5][0] = "penguin";
            board[6][1] = "penguin";
            board[7][2] = "penguin";
            board[8][3] = "penguin";
            board[9][4] = "";

            const result = placeMove(9, 4);

            assert.equal(result.success, true);
            assert.equal(result.type, "win");
            assert.equal(result.player, "penguin");
            assert.equal(result.winningCells.length, 5);
        });

        it("should detect a diagonal win from top-right to bottom-left", function () {
            const board = getBoard();

            board[5][4] = "penguin";
            board[6][3] = "penguin";
            board[7][2] = "penguin";
            board[8][1] = "penguin";
            board[9][0] = "";

            const result = placeMove(9, 0);

            assert.equal(result.success, true);
            assert.equal(result.type, "win");
            assert.equal(result.player, "penguin");
            assert.equal(result.winningCells.length, 5);
        });

        it("should not count four connected pieces as a win", function () {
            const board = getBoard();

            board[1][0] = "penguin";
            board[1][1] = "penguin";
            board[1][2] = "penguin";
            board[1][3] = "";

            const result = placeMove(1, 3);

            assert.equal(result.success, true);
            assert.equal(result.type, "normal");
        });

    });

    describe("Remove skill", function () {

        it("should start remove mode when the current player has not used the skill", function () {
            const result = startRemoveSkill();

            assert.equal(result.success, true);
            assert.equal(getRemoveMode(), true);
        });

        it("should remove an opponent piece", function () {
            const board = getBoard();

            board[1][0] = "seagull";

            const result = removeOpponentPiece(1, 0);

            assert.equal(result.success, true);
            assert.equal(board[1][0], "");
            assert.equal(getSkillsUsed().penguin.remove, true);
            assert.equal(getRemoveMode(), false);
        });

        it("should not remove the current player's own piece", function () {
            const board = getBoard();

            board[1][0] = "penguin";

            const result = removeOpponentPiece(1, 0);

            assert.equal(result.success, false);
            assert.equal(board[1][0], "penguin");
        });

        it("should not remove an empty cell", function () {
            const board = getBoard();

            board[1][0] = "";

            const result = removeOpponentPiece(1, 0);

            assert.equal(result.success, false);
            assert.equal(board[1][0], "");
        });

        it("should not allow the same player to start remove skill twice", function () {
            const board = getBoard();

            board[1][0] = "seagull";

            startRemoveSkill();
            removeOpponentPiece(1, 0);

            const result = startRemoveSkill();

            assert.equal(result.success, false);
        });

    });

    describe("Score system", function () {

        it("should increase winner's win score after a win", function () {
            const board = getBoard();
            const oldScore = getScores().penguin.win;

            board[1][0] = "penguin";
            board[1][1] = "penguin";
            board[1][2] = "penguin";
            board[1][3] = "penguin";
            board[1][4] = "";

            placeMove(1, 4);

            assert.equal(getScores().penguin.win, oldScore + 1);
        });

        it("should increase opponent's loss score after a win", function () {
            const board = getBoard();
            const oldScore = getScores().seagull.loss;

            board[1][0] = "penguin";
            board[1][1] = "penguin";
            board[1][2] = "penguin";
            board[1][3] = "penguin";
            board[1][4] = "";

            placeMove(1, 4);

            assert.equal(getScores().seagull.loss, oldScore + 1);
        });

    });

    describe("Restart game", function () {

        it("should restart the game and return a turn message", function () {
            const result = restartGameData();

            assert.equal(result.message.includes("'s turn"), true);
        });

        it("should reset remove mode after restart", function () {
            startRemoveSkill();

            restartGameData();

            assert.equal(getRemoveMode(), false);
        });

        it("should reset remove skill usage after restart", function () {
            const board = getBoard();

            board[1][0] = "seagull";

            startRemoveSkill();
            removeOpponentPiece(1, 0);

            restartGameData();

            assert.equal(getSkillsUsed().penguin.remove, false);
            assert.equal(getSkillsUsed().seagull.remove, false);
        });

        it("should switch starting player after restart", function () {
            const beforeRestart = getCurrentPlayer();

            restartGameData();

            const afterRestart = getCurrentPlayer();

            assert.notEqual(afterRestart, beforeRestart);
        });

    });

});