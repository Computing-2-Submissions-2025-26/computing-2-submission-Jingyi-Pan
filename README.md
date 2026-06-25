[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/H6lPFq0J)
# Computing 2 Coursework Submission.
**CID**: 02563562

This is the submission template for your Computing 2 Applications coursework submission.

## Checklist
### Install dependencies locally
This template relies on a a few packages from the Node Package Manager, npm.
To install them run the following commands in the terminal.
```properties
npm install
```
These won't be uploaded to your repository because of the `.gitignore`.
I'll run the same commands when I download your repos.

### Game Module – API
*You will produce an API specification, i.e. a list of function names and their signatures, for a Javascript module that represents the state of your game and the operations you can perform on it that advances the game or provides information.*

- [ ] Include a `.js ` module file in `/web-app` containing the API using `jsdoc`.
- [ ] Update `/jsdoc.json` to point to this module in `.source.include` (line 7)
- [ ] Compile jsdoc using the run configuration `Generate Docs`
- [ ] Check the generated docs have compiled correctly.

### Game Module – Implementation
*You will implement, in Javascript, the module you specified above. Such that your game can be simulated in code, e.g. in the debug console.*

- [ ] The file above should be fully implemented.

### Unit Tests – Specification
*For the Game module API you have produced, write a set of unit tests descriptions that specify the expected behaviour of one aspect of your API, e.g. you might pick the win condition, or how the state changes when a move is made.*

- [ ] Write unit test definitions in `/web-app/tests`.
- [ ] Check the headings appear in the Testing sidebar.

### Unit Tests – Implementation
*Implement in code the unit tests specified above.*

- [ ] Implement the tests above.

### Web Application
*Produce a web application that allows a user to interface with your game module.*

- Implement in `/web-app`
  - [ ] `index.html`
  - [ ] `default.css`
  - [ ] `main.js`
  - [ ] Any other files you need to include.

### Finally
- [ ] Push to GitHub.
- [ ] Sync the changes.
- [ ] Check submission on GitHub website.

---

# Penguin vs Seagull Gomoku

Penguin vs Seagull Gomoku is a browser-based two-player strategy game built with HTML, CSS and JavaScript. The game follows the classic Gomoku (Connect Five) rules while introducing obstacles and a one-time remove skill for each player.

## Game Rules

- Players take turns placing pieces on a 15 × 15 board.
- The first player to connect five pieces horizontally, vertically or diagonally wins.
- Rock cells are obstacles and cannot be occupied.
- If the board becomes full before either player wins, the game ends in a draw.
- Each player may use **Remove Opponent Piece** once per game to remove one opponent piece. Using this skill does not end the player's turn.

## Running the Project

Install dependencies:

```bash
npm install
```

Run the unit tests:

```bash
npm test
```

## References and Acknowledgements

The implementation of the Gomoku game logic and win detection algorithm was developed with reference to the following tutorial:

- Dynamic Tic Tac Toe / Gomoku / Five In a Row with Minimax  
  https://www.youtube.com/watch?v=EyXGGch2fnE

ChatGPT was used as a programming assistant to help debug code, refactor the project structure.

Win and draw animations were generated using Seedance.

The penguin and seagull character designs were inspired by Jellycat plush toys. These assets are included for educational coursework only. This project is not affiliated with or endorsed by Jellycat.