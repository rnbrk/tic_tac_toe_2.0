// tic tac toe web app

'use strict';


function fill2DArray(rows, columns, Func) {
  const board = [];
  for (let y = 0; y < rows; y += 1) {
    const row = [];
    for (let x = 0; x < columns; x += 1) {
      row.push(new Func());
    }
    board.push(row);
  }
  return board;
}

function flip2DArrayHorizontal(matrix) {
  return matrix.map(row => row.map((v, index) => row[row.length - index - 1]));
}

function getAllDiagonals(matrix) {
  function iterateOneDiagonal(matrix, startRow, startColumn) {
    let row = startRow;
    let column = startColumn;
    const diagonal = [];

    while (true) {
      if (row > Math.max(startRow, startColumn) || column < 0) {
        break;
      }

      diagonal.push(matrix[row][column]);
      row += 1;
      column -= 1;
    }

    return diagonal;
  }

  const amountOfSquares = matrix.length;
  const diagonals = [];

  // top horizontal row
  for (let i = 0; i < amountOfSquares; i += 1) {
    const diagonal = iterateOneDiagonal(matrix, 0, i);
    diagonals.push(diagonal);
  }

  // right vertical row starts at + 1
  for (let i = 1; i < amountOfSquares; i += 1) {
    const diagonal = iterateOneDiagonal(matrix, i, amountOfSquares - 1);
    diagonals.push(diagonal);
  }

  return diagonals;
}

function getAllCombinationsOf2DArray(matrix) {
  const allRows = matrix.map(row => row);
  const allColumns = matrix[0].map((column, index) => matrix.map(row => row[index]));
  const allDiagonals = getAllDiagonals(matrix);
  const allDiagonalsFlipped = getAllDiagonals(flip2DArrayHorizontal(matrix));

  let result = [];
  result = result.concat(allRows, allColumns, allDiagonals, allDiagonalsFlipped);

  return result;
}

function findWinnerInRow(row, tilesNeededToWin) {
  let longestStreak = 0;
  let typeOfLongestStreak;

  let currentStreak = 0;
  let typeOfCurrentStreak;

  row.forEach((tile, index) => {
    const previousTile = row[index - 1];

    // if we find an empty tile
    if (!tile.isTaken) {
      currentStreak = 0;
      typeOfCurrentStreak = undefined;
    }

    // if it is the first tile
    if (index === 0) {
      currentStreak = 1;
      typeOfCurrentStreak = tile;
      longestStreak = currentStreak;
      typeOfLongestStreak = typeOfCurrentStreak;
    } else {
      // if the tile is different from the previous one
      if (index > 0 && tile.type !== previousTile.type && tile.isTaken) {
        currentStreak = 1;
        typeOfCurrentStreak = tile;
      }

      // if the tile is the same
      if (
        previousTile === undefined
        || (tile.type === previousTile.type && tile.isTaken)
      ) {
        currentStreak += 1;
        typeOfCurrentStreak = tile;
      }
    }

    // Check if we have found a new longest streak
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
      typeOfLongestStreak = typeOfCurrentStreak;
    }
  });

  if (longestStreak >= tilesNeededToWin) {
    return typeOfLongestStreak;
  }

  return null;
}

function findWinner(matrix, tilesNeededToWin) {
  for (let i = 0; i < matrix.length; i += 1) {
    const row = matrix[i];
    const winner = findWinnerInRow(row, tilesNeededToWin);
    if (winner !== null) {
      return winner;
    }
  }
  return null;
}

function Tile(type = '') {
  if (typeof type !== 'string') {
    throw new Error('Type of tile can only be a string.');
  }

  this.type = type;
  this.isTaken = Boolean(this.type);
}

Tile.prototype.toString = function toString() {
  return this.type;
};

// GAME OBJECT

function Game(width, tilesNeededToWin) {
  this.width = width;
  this.tilesNeededToWin = tilesNeededToWin;
  this.observerList = [];
  this.start = function start() {
    this.generateBoard(width);
  };
  this.isGameRunning = false;
  this.itsXsTurn = true;
  this.players = {
    true: { type: 'X', score: 0 },
    false: { type: 'O', score: 0 },
  };
  this.winner = undefined;
}

Game.prototype.generateBoard = function generateBoard(width) {
  this.board = fill2DArray(width, width, Tile);
  this.width = width;
  this.winner = undefined;
  // this.updateView();
};

Game.prototype.startGame = function startGame() {
  this.isGameRunning = true;
  this.winner = undefined;
  this.board = fill2DArray(this.width, this.width, Tile);
  this.updateView();
};

Game.prototype.reset = function reset() {
  this.board = fill2DArray(this.width, this.width, Tile);
  this.winner = undefined;
  this.isGameRunning = false;
  this.updateView();
};

Game.prototype.restart = function restart() {
  this.reset();
  this.players = {
    true: { type: 'X', score: 0 },
    false: { type: 'O', score: 0 },
  };
  this.itsXsTurn = true;
  this.updateView();
};

Game.prototype.addObserver = function addObserver(observer) {
  this.observerList.push(observer);
};
Game.prototype.updateView = function updateView() {
  this.observerList.forEach((observer) => {
    observer.update({
      board: this.board,
      turn: this.players[this.itsXsTurn].type,
      winner: this.winner,
      players: this.players,
      isGameRunning: this.isGameRunning,
      width: this.width,
    });
  });
};

Game.prototype.buildView = function buildView() {
  this.observerList.forEach((observer) => {
    observer.build({
      board: this.board,
      turn: this.players[this.itsXsTurn].type,
      winner: this.winner,
      players: this.players,
      isGameRunning: this.isGameRunning,
      width: this.width,
    });
  });
};


Game.prototype.addTic = function addTic(x, y) {
  const canAddTic = !this.board[y][x].isTaken && this.isGameRunning;

  if (canAddTic) {
    this.board[y][x].type = this.players[this.itsXsTurn].type;
    this.board[y][x].isTaken = true;

    const allRowsToCheck = getAllCombinationsOf2DArray(this.board);
    const possibleWinner = findWinner(allRowsToCheck, this.tilesNeededToWin);
    if (possibleWinner != null) {
      this.winner = this.players[this.itsXsTurn].type;
      this.players[this.itsXsTurn].score += 1;
      this.isGameRunning = false;
    }
    this.itsXsTurn = !this.itsXsTurn;
    this.updateView();
  }
};

// Controller

const controller = {
  listen(game) {
    const gameComponent = document.getElementById('tictactoe');
    gameComponent.addEventListener('click', (event) => {
      const clickedElement = event.target;
      if (clickedElement.classList.contains('tile')) {
        game.addTic(clickedElement.getAttribute('x'), clickedElement.getAttribute('y'));
      }

      if (clickedElement.classList.contains('button-reset')) {
        if (game.isGameRunning) {
          game.reset();
        } else {
          game.startGame();
        }
      }

      if (clickedElement.classList.contains('button-restart')) {
        game.restart();
      }
    });
    gameComponent.addEventListener('input', (event) => {
      const draggedElement = event.target;
      const canBoardBeResized = draggedElement.id === 'slider-adjust-size' && !game.isGameRunning;

      if (canBoardBeResized) {
        game.generateBoard(draggedElement.value);
        game.updateView();
      }
    });
  },
};


// Views

function generateRowToElements(row, y, isGameRunning) {
  const rowElement = document.createElement('tr');

  row.forEach((tile, x) => {
    const tileElement = document.createElement('td');
    tileElement.textContent = tile.type;

    if (isGameRunning) {
      tileElement.classList.add('tile', 'tile-active');
    } else {
      tileElement.classList.add('tile');
    }
    tileElement.setAttribute('x', x);
    tileElement.setAttribute('y', y);
    rowElement.appendChild(tileElement);
  });

  return rowElement;
}

const htmlView = {
  build: (state) => {
    const container = document.getElementById('tictactoe');

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const header = document.createElement('h1');
    header.textContent = 'Tic-tac-toe 2.0';
    container.appendChild(header);

    const gameInfoElement = document.createElement('div');
    gameInfoElement.setAttribute('id', 'gameinfo');
    container.appendChild(gameInfoElement);

    const turnElement = document.createElement('div');
    turnElement.setAttribute('id', 'turn');
    turnElement.textContent = `${state.turn}`;
    gameInfoElement.appendChild(turnElement);

    const scoreElement = document.createElement('div');
    scoreElement.setAttribute('id', 'score');

    const scoreP1 = document.createElement('h3');
    scoreP1.setAttribute('id', 'score-p1');
    scoreP1.textContent = `${state.players.true.type}: ${state.players.true.score}`;

    const scoreP2 = document.createElement('h3');
    scoreP2.setAttribute('id', 'score-p2');
    scoreP2.textContent = `${state.players.false.type}: ${state.players.false.score}`;

    scoreElement.appendChild(scoreP1);
    scoreElement.appendChild(scoreP2);
    gameInfoElement.appendChild(scoreElement);

    const resetButton = document.createElement('button');
    resetButton.classList.add('button', 'button-reset');
    resetButton.setAttribute('id', 'button-reset');
    resetButton.textContent = 'Play';

    gameInfoElement.appendChild(resetButton);

    const restartButton = document.createElement('button');
    restartButton.classList.add('button', 'button-restart');
    restartButton.textContent = 'Restart';
    gameInfoElement.appendChild(restartButton);

    const sliderContainer = document.createElement('div');
    sliderContainer.setAttribute('id', 'slidercontainer');
    container.appendChild(sliderContainer);

    const slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', '3');
    slider.setAttribute('max', '10');
    slider.setAttribute('value', state.width);
    slider.setAttribute('class', 'slider');
    slider.setAttribute('id', 'slider-adjust-size');
    sliderContainer.appendChild(slider);

    const table = document.createElement('table');
    table.setAttribute('id', 'table-tictactoe');
    container.appendChild(table);

    state.board.forEach((row, y) => {
      table.appendChild(generateRowToElements(row, y, state.isGameRunning));
    });

    const winnerElement = document.createElement('h2');
    winnerElement.setAttribute('id', 'score-winner');
    container.appendChild(winnerElement);
  },

  update: (state) => {
    const turnElement = document.getElementById('turn');
    turnElement.textContent = `${state.turn}`;

    const scoreP1 = document.getElementById('score-p1');
    scoreP1.textContent = `${state.players.true.type}: ${state.players.true.score}`;

    const scoreP2 = document.getElementById('score-p2');
    scoreP2.textContent = `${state.players.false.type}: ${state.players.false.score}`;

    const resetButton = document.getElementById('button-reset');

    if (state.isGameRunning) {
      resetButton.textContent = 'Clear';
    } else {
      resetButton.textContent = 'Play';
    }
    const slider = document.getElementById('slider-adjust-size');
    slider.setAttribute('value', state.width);

    if (state.isGameRunning) {
      slider.classList.add('slider-inactive');
      slider.disabled = true;
    } else {
      slider.classList.remove('slider-inactive');
      slider.disabled = false;
    }

    const table = document.getElementById('table-tictactoe');
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
    state.board.forEach((row, y) => {
      table.appendChild(generateRowToElements(row, y, state.isGameRunning));
    });

    const winnerElement = document.getElementById('score-winner');
    if (state.winner !== undefined) {
      winnerElement.textContent = `The winner is ${state.winner}!`;
    } else {
      winnerElement.textContent = '';
    }
  },
};

const game = new Game(3, 3);
game.addObserver(htmlView);
game.start();
game.buildView();
controller.listen(game);
