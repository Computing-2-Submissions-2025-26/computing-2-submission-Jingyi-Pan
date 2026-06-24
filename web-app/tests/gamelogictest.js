import assert from "node:assert/strict";

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
} from "../game-logic.js";

describe("Gomoku game logic", function () {

    beforeEach(function () {
        restartGameData();
    });

    it("creates a 15 by 15 board", function () {
        createBoardData();

        const board = getBoard();

        assert.equal(getBoardSize(), 15);
        assert.equal(board.length, 15);
        assert.equal(board[0].length, 15);
    });

    it("places obstacles on the board", function () {
        createBoardData();

        const board = getBoard();

        let obstacleCount = 0;

        for (let row = 0; row < getBoardSize(); row += 1) {
            for (let col = 0; col < getBoardSize(); col += 1) {
                if (board[row][col] === "obstacle") {
                    obstacleCount += 1;
                }
            }
        }

        assert.equal(obstacleCount, 15);
    });

    it("starts with penguin or seagull as the current player", function () {
        const currentPlayer = getCurrentPlayer();

        assert.ok(
            currentPlayer === "penguin" || currentPlayer === "seagull"
        );
    });

    it("places a piece on an empty cell", function () {
        createBoardData();

        const player = getCurrentPlayer();
        const result = placeMove(0, 0);

        assert.equal(result.success, true);
        assert.equal(getBoard()[0][0], player);
    });

    it("does not allow a move on an occupied cell", function () {
        createBoardData();

        placeMove(0, 0);
        const result = placeMove(0, 0);

        assert.equal(result.success, false);
    });

    it("switches player after a normal move", function () {
        createBoardData();

        const firstPlayer = getCurrentPlayer();

        placeMove(0, 0);

        const secondPlayer = getCurrentPlayer();

        assert.notEqual(secondPlayer, firstPlayer);
    });

    it("returns the correct player display name", function () {
        assert.equal(getPlayerName("penguin"), "Penguin");
        assert.equal(getPlayerName("seagull"), "Seagull");
    });

    it("allows remove skill to be started once", function () {
        createBoardData();

        const result = startRemoveSkill();

        assert.equal(result.success, true);
        assert.equal(getRemoveMode(), true);
    });

    it("does not allow removing an empty square", function () {
        createBoardData();

        startRemoveSkill();

        const result = removeOpponentPiece(0, 0);

        assert.equal(result.success, false);
        assert.equal(result.message, "You can only remove opponent's piece");
    });

    it("resets remove skill after restart", function () {
        createBoardData();

        startRemoveSkill();
        restartGameData();

        assert.equal(getRemoveMode(), false);

        const currentPlayer = getCurrentPlayer();
        const skillsUsed = getSkillsUsed();

        assert.equal(skillsUsed[currentPlayer].remove, false);
    });

   it("updates score when a player wins with five connected pieces", function () {
            createBoardData();

            const board = getBoard();
            const currentPlayer = getCurrentPlayer();
            const scoresBefore = getScores()[currentPlayer].win;

            let winRow = 0;
            let winStartCol = 0;
            let foundWinningLine = false;

            for (let row = 0; row < getBoardSize(); row += 1) {
                for (let col = 0; col <= getBoardSize() - 5; col += 1) {
                    if (
                        board[row][col] === "" &&
                        board[row][col + 1] === "" &&
                        board[row][col + 2] === "" &&
                        board[row][col + 3] === "" &&
                        board[row][col + 4] === ""
                    ) {
                        winRow = row;
                        winStartCol = col;
                        foundWinningLine = true;
                    }
                }
            }

            assert.equal(foundWinningLine, true);

            const fillerCells = [];

            for (let row = 0; row < getBoardSize(); row += 1) {
                for (let col = 0; col < getBoardSize(); col += 1) {
                    const isWinningCell = (
                        row === winRow &&
                        col >= winStartCol &&
                        col <= winStartCol + 4
                    );

                    if (board[row][col] === "" && !isWinningCell) {
                        fillerCells.push([row, col]);
                    }
                }
            }

            placeMove(winRow, winStartCol);
            placeMove(fillerCells[0][0], fillerCells[0][1]);

            placeMove(winRow, winStartCol + 1);
            placeMove(fillerCells[1][0], fillerCells[1][1]);

            placeMove(winRow, winStartCol + 2);
            placeMove(fillerCells[2][0], fillerCells[2][1]);

            placeMove(winRow, winStartCol + 3);
            placeMove(fillerCells[3][0], fillerCells[3][1]);

            const result = placeMove(winRow, winStartCol + 4);

            assert.equal(result.type, "win");
            assert.equal(result.player, currentPlayer);
            assert.equal(getScores()[currentPlayer].win, scoresBefore + 1);
    });
});