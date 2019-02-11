import { fill2DArray, getAllCombinationsOf2DArray } from './modules/2Darray.mjs';

function Tile(type = '') {
  if (typeof type !== 'string') {
    throw new Error('Type of tile can only be a string.');
  }

  this.type = type;
  this.isTaken = Boolean(this.type);

  const proto = this.constructor.prototype;
  proto.toString = function toString() {
    return this.type;
  };
}

// GAME OBJECT

function Game(observers) {
  this.width = 3;
  this.tilesNeededToWin = this.width;
  this.amountOfTurns = 0;
  this.observerList = Array.isArray(observers) ? observers : [observers];
  this.isGameRunning = false;
  this.itsXsTurn = true;
  this.players = {
    true: { type: 'X', score: 0 },
    false: { type: 'O', score: 0 },
  };
  this.winner = undefined;
  this.showEndScreen = false;

  const proto = this.constructor.prototype;

  proto.generateBoard = function generateBoard() {
    this.board = fill2DArray(this.width, this.width, Tile);
  };
  proto.startNewGame = function startNewGame() {
    this.generateBoard();
    this.isGameRunning = true;
    this.winner = undefined;
  };
  proto.resetBoard = function resetBoard() {
    this.generateBoard();
    this.winner = undefined;
    this.isGameRunning = false;
    this.amountOfTurns = 0;
  };
  proto.restartGame = function restartGame() {
    this.resetBoard();
    this.players = {
      true: { type: 'X', score: 0 },
      false: { type: 'O', score: 0 },
    };
    this.itsXsTurn = true;
  };
  proto.gameIsDraw = function gameIsDraw() {
    return this.winner === undefined && this.amountOfTurns >= (this.width * this.width);
  };
  proto.addObserver = function addObserver(observer) {
    this.observerList.push(observer);
  };
  proto.setShowEndScreen = function setShowEndScreen(boolean) {
    this.showEndScreen = boolean;
  };
  proto.setGameBoardSize = function setGameBoardSize(number) {
    this.width = number;
    this.tilesNeededToWin = number;
  };
  proto.updateView = function updateView() {
    this.observerList.forEach((observer) => {
      observer.update({
        board: this.board,
        turn: this.players[this.itsXsTurn].type,
        winner: this.winner,
        players: this.players,
        isGameRunning: this.isGameRunning,
        width: this.width,
        showEndScreen: this.showEndScreen,
        tilesNeededToWin: this.tilesNeededToWin,
      });
    });
  };

  proto.findWinnerInRow = function findWinnerInRow(row, tilesNeededToWin) {
    let longestStreak = 0;
    let typeOfLongestStreak;

    let currentStreak = 0;
    let typeOfCurrentStreak;

    row.forEach((tile, index) => {
      const previousTile = row[index - 1];

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

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        typeOfLongestStreak = typeOfCurrentStreak;
      }
    });

    if (longestStreak >= tilesNeededToWin) {
      return typeOfLongestStreak;
    }

    return null;
  };

  proto.findWinner = function findWinner(matrix, tilesNeededToWin) {
    for (let i = 0; i < matrix.length; i += 1) {
      const row = matrix[i];
      // eslint-disable-next-line react/no-this-in-sfc
      const winner = this.findWinnerInRow(row, tilesNeededToWin);
      if (winner !== null) {
        return winner;
      }
    }
    return null;
  };

  proto.showWinner = function showWinner() {
    this.winner = this.players[this.itsXsTurn].type;
    this.showEndScreen = true;
    this.players[this.itsXsTurn].score += 1;
    this.amountOfTurns = 0;
    this.isGameRunning = false;
  };

  proto.showDraw = function showDraw() {
    this.showEndScreen = true;
    this.amountOfTurns = 0;
    this.isGameRunning = false;
    Object.keys(this.players).forEach((element) => { this.players[element].score += 1; });
  };

  proto.addTic = function addTic(x, y) {
    const canAddTic = !this.board[y][x].isTaken && this.isGameRunning;

    if (canAddTic) {
      this.amountOfTurns += 1;
      this.board[y][x].type = this.players[this.itsXsTurn].type;
      this.board[y][x].isTaken = true;

      const allRowsToCheck = getAllCombinationsOf2DArray(this.board);
      const possibleWinner = this.findWinner(allRowsToCheck, this.tilesNeededToWin);
      if (possibleWinner != null) {
        this.showWinner();
      }
      if (this.gameIsDraw()) {
        this.showDraw();
      }
      this.itsXsTurn = !this.itsXsTurn;
    }
  };
  proto.setTilesNeededToWin = function setTilesNeededToWin(val) {
    if (val > 3 && val <= this.width) {
      this.tilesNeededToWin = val;
    } else {
      throw new Error('game.tilesNeededToWin cannot be less than 3 or greater than game.width');
    }
  };

  this.generateBoard();
  this.updateView();
}

// Controller

const controller = {
  listen(game) {
    const gameComponent = document.getElementById('tictactoe');
    gameComponent.addEventListener('click', (event) => {
      const clickedElement = event.target;
      if (clickedElement.classList.contains('tile')) {
        game.addTic(clickedElement.getAttribute('x'), clickedElement.getAttribute('y'));
      }

      if (clickedElement.classList.contains('button-resetBoard')) {
        if (game.isGameRunning) {
          game.resetBoard();
        } else {
          game.startNewGame();
        }
      }

      if (clickedElement.getAttribute('id') === 'score-winner') {
        game.setShowEndScreen(false);
      }

      if (clickedElement.classList.contains('button-restart')) {
        game.restartGame();
      }
      game.updateView();
    });
    gameComponent.addEventListener('input', (event) => {
      const inputElement = event.target;
      const canBoardBeResized = inputElement.id === 'slider-adjust-size' && !game.isGameRunning;

      if (canBoardBeResized) {
        game.setGameBoardSize(inputElement.value);
        game.resetBoard();
      }

      game.updateView();
    });
  },
};


// Views

function generateRowToElements(row, y, isGameRunning) {
  const rowElement = document.createElement('tr');

  row.forEach((tile, x) => {
    const tileElement = document.createElement('td');

    if (tile.type) {
      const tileImg = document.createElement('img');
      if (tile.type === 'X') {
        tileImg.setAttribute('src', '../img/x.png');
      } else if (tile.type === 'O') {
        tileImg.setAttribute('src', '../img/o.png');
      } else {
        throw new Error(`Tile at position ${x} ${y} is not X, O or empty.`);
      }

      tileElement.appendChild(tileImg);
    }

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

function allElementsExist(arrayOfQueries) {
  return arrayOfQueries.every(query => document.querySelector(query) != null);
}

function setAttributes(elem, object) {
  for (let attribute in object) {
    if (object.hasOwnProperty(attribute)) {
      if (attribute === 'class' && Array.isArray(object[attribute])) {
        elem.classList.add(...object[attribute]);
      } else {
        elem.setAttribute(attribute, object[attribute]);
      }
    }
  }
}

const htmlView = {

  update(state) {
    const arrayOfQueries = ['#turn-img', '#score-p1', '#score-p2',
      '#button-resetBoard', '#slider-adjust-size', '#table-tictactoe',
      '#tictactoe'];
    if (allElementsExist(arrayOfQueries)) {
      this.updateView(state);
    } else {
      this.buildView(state);
    }
  },

  updateView(state) {
    const turnImg = document.getElementById('turn-img');
    if (state.turn === 'X') {
      turnImg.setAttribute('src', '../img/x.png');
    } else if (state.turn === 'O') {
      turnImg.setAttribute('src', '../img/o.png');
    } else {
      throw new Error('Tile at turn indicator is not X, O or empty.');
    }

    const scoreP1 = document.getElementById('score-p1');
    scoreP1.textContent = `${state.players.true.type}: ${state.players.true.score}`;

    const scoreP2 = document.getElementById('score-p2');
    scoreP2.textContent = `${state.players.false.type}: ${state.players.false.score}`;

    const resetBoardButton = document.getElementById('button-resetBoard');

    if (state.isGameRunning) {
      resetBoardButton.textContent = 'Clear';
    } else {
      resetBoardButton.textContent = 'Play';
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

    if (state.showEndScreen === true) {
      const container = document.getElementById('tictactoe');
      const endScreenTextElement = document.createElement('h1');
      endScreenTextElement.setAttribute('id', 'score-winner');

      if (state.winner !== undefined) {
        endScreenTextElement.textContent = `The winner is ${state.winner}!`;
      } else {
        endScreenTextElement.textContent = 'The game is a draw.';
      }
      container.appendChild(endScreenTextElement);
    }
    const endScreenTextElementExists = document.getElementById('score-winner');
    if (endScreenTextElementExists && !state.showEndScreen) {
      endScreenTextElementExists.remove();
    }
  },

  buildView(state) {
    const container = document.getElementById('tictactoe');
    container.setAttribute('class', 'noselect');

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

    const turnImg = document.createElement('img');
    turnImg.setAttribute('id', 'turn-img');
    if (state.turn === 'X') {
      turnImg.setAttribute('src', '../img/x.png');
    } else if (state.turn === 'O') {
      turnImg.setAttribute('src', '../img/o.png');
    } else {
      throw new Error('Tile at turn indicator is not X, O or empty.');
    }
    turnElement.appendChild(turnImg);
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

    const resetBoardButton = document.createElement('button');
    setAttributes(resetBoardButton, {
      id: 'button-resetBoard',
      class: ['button', 'button-resetBoard']
    });
    resetBoardButton.textContent = 'Play';

    gameInfoElement.appendChild(resetBoardButton);

    const restartButton = document.createElement('button');
    setAttributes(restartButton, { class: ['button', 'button-restart'] })
    restartButton.textContent = 'Restart';
    gameInfoElement.appendChild(restartButton);

    const sliderContainer = document.createElement('div');
    sliderContainer.setAttribute('id', 'slidercontainer');
    container.appendChild(sliderContainer);

    const slider = document.createElement('input');
    setAttributes(slider, {
      type: 'range',
      min: 3,
      max: 8,
      value: state.width,
      class: 'slider',
      id: 'slider-adjust-size'
    });

    sliderContainer.appendChild(slider);

    const table = document.createElement('table');
    table.setAttribute('id', 'table-tictactoe');
    container.appendChild(table);

    state.board.forEach((row, y) => {
      table.appendChild(generateRowToElements(row, y, state.isGameRunning));
    });
  },
};

const game = new Game(htmlView);
controller.listen(game);
