import { fill2DArray, getAllCombinationsOf2DArray } from './modules/2Darray.mjs';
import {
  allElementsExist, setAttributes, appendChildren, removeAllChildren,
} from './modules/domfunctions.mjs';

function main() {
  const PLAYERX = 'X';
  const PLAYERO = 'O';

  const X_IMG = '../img/x.png';
  const O_IMG = '../img/o.png';


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

  function Game(observers) {
    this.width = 3;
    this.tilesNeededToWin = this.width;
    this.amountOfTurns = 0;
    this.observerList = Array.isArray(observers) ? observers : [observers];
    this.isGameRunning = false;
    this.itsXsTurn = true;
    this.players = {
      true: { type: PLAYERX, score: 0 },
      false: { type: PLAYERO, score: 0 },
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
        true: { type: PLAYERX, score: 0 },
        false: { type: PLAYERO, score: 0 },
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

        const firstTile = index === 0;
        if (firstTile) {
          currentStreak = 1;
          typeOfCurrentStreak = tile;
          longestStreak = currentStreak;
          typeOfLongestStreak = typeOfCurrentStreak;
        } else {
          const tileDifferentFromPrevious = index > 0
            && tile.type !== previousTile.type
            && tile.isTaken;

          if (tileDifferentFromPrevious) {
            currentStreak = 1;
            typeOfCurrentStreak = tile;
          }
          const tileSameAsPrevious = previousTile === undefined
            || (tile.type === previousTile.type && tile.isTaken);

          if (tileSameAsPrevious) {
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

    // Run when initialized:
    this.generateBoard();
    this.updateView();
  }

  const controller = {

    listen(game) {
      const gameComponent = document.querySelector('#tictactoe');
      gameComponent.addEventListener('click', (event) => {
        const clickedElement = event.target;

        const isResetButton = clickedElement.getAttribute('id') === 'button-play-clear';
        const isEndScreen = clickedElement.getAttribute('id') === 'screen-endscreen';
        const isRestartButton = clickedElement.getAttribute('id') === 'button-restart';
        const isGameTile = clickedElement.classList.contains('tile');

        if (isGameTile) {
          game.addTic(clickedElement.getAttribute('x'), clickedElement.getAttribute('y'));
        }

        if (isResetButton) {
          if (game.isGameRunning) {
            game.resetBoard();
          } else {
            game.startNewGame();
          }
        }

        if (isEndScreen) {
          game.setShowEndScreen(false);
        }

        if (isRestartButton) {
          game.restartGame();
        }
        game.updateView();
      });

      gameComponent.addEventListener('input', (event) => {
        const inputElement = event.target;
        const canBoardBeResized = inputElement.id === 'slider-changesize' && !game.isGameRunning;

        if (canBoardBeResized) {
          game.setGameBoardSize(inputElement.value);
          game.resetBoard();
        }

        game.updateView();
      });
    },
  };

  const htmlView = {

    update(state) {
      const arrayOfQueries = ['#gameinfo-navbar',
        '#nav-turn-element', '#nav-score-element', '#score-p1', '#score-p2',
        '#button-play-clear', '#button-restart', '#slider-wrapper', '#slider-changesize',
        '#table-gameboard'];

      if (allElementsExist(arrayOfQueries)) {
        this.updateView(state);
      } else {
        this.buildView(state);
      }
    },

    updateView(state) {
      const turnImg = document.querySelector('#img-turn');

      this.setTileImgAttributes(turnImg, state, 'img-turn');

      const scoreP1 = document.querySelector('#score-p1');
      scoreP1.textContent = `${state.players.true.type}: ${state.players.true.score}`;

      const scoreP2 = document.querySelector('#score-p2');
      scoreP2.textContent = `${state.players.false.type}: ${state.players.false.score}`;

      const resetBoardButton = document.querySelector('#button-play-clear');

      if (state.isGameRunning) {
        resetBoardButton.textContent = 'Clear';
      } else {
        resetBoardButton.textContent = 'Play';
      }
      const slider = document.querySelector('#slider-changesize');
      slider.setAttribute('value', state.width);

      if (state.isGameRunning) {
        slider.classList.add('slider-inactive');
        slider.disabled = true;
      } else {
        slider.classList.remove('slider-inactive');
        slider.disabled = false;
      }

      const table = document.querySelector('#table-gameboard');
      removeAllChildren(table);

      state.board.forEach((row, y) => {
        table.appendChild(this.generateRowToElements(row, y, state.isGameRunning));
      });

      if (state.showEndScreen === true) {
        const container = document.querySelector('#tictactoe');
        const endScreenTextElement = document.createElement('div');
        setAttributes(endScreenTextElement, { id: 'screen-endscreen', class: ['screen', 'screen-endscreen'] });

        if (state.winner !== undefined) {
          endScreenTextElement.textContent = `The winner is ${state.winner}!`;
        } else {
          endScreenTextElement.textContent = 'The game is a draw.';
        }
        container.appendChild(endScreenTextElement);
      }
      const endScreenTextElementExists = document.querySelector('#screen-endscreen');
      if (endScreenTextElementExists && !state.showEndScreen) {
        endScreenTextElementExists.remove();
      }
    },

    setTileImgAttributes(img, state, id) {
      setAttributes(img, {
        id,
        src: state.turn === PLAYERX ? X_IMG : O_IMG,
        class: 'img-xo',
      });
      return img;
    },

    buildView(state) {
      const container = document.querySelector('#tictactoe');
      removeAllChildren(container);
      setAttributes(container, { class: ['game-tictactoe', 'noselect'] });

      const header = document.createElement('h1');
      setAttributes(header, { class: ['text', 'text-header'] });
      header.textContent = 'Tic-tac-toe 2.0';

      const gameInfoElement = document.createElement('div');
      setAttributes(gameInfoElement, { id: 'gameinfo-navbar', class: 'navbar' });

      const turnElement = document.createElement('div');
      setAttributes(turnElement, { id: 'nav-turn-element', class: ['nav', 'nav-turn'] });

      const turnImg = document.createElement('img');
      this.setTileImgAttributes(turnImg, state, 'img-turn');

      const scoreElement = document.createElement('div');
      setAttributes(scoreElement, { id: 'nav-score-element', class: ['nav', 'nav-score'] });

      const scoreP1 = document.createElement('h3');
      setAttributes(scoreP1, {
        id: 'score-p1', class: 'text-score',
      });
      scoreP1.textContent = `${state.players.true.type}: ${state.players.true.score}`;

      const scoreP2 = document.createElement('h3');
      setAttributes(scoreP2, { id: 'score-p2', class: 'text-score' });
      scoreP2.textContent = `${state.players.false.type}: ${state.players.false.score}`;

      const resetBoardButton = document.createElement('button');
      setAttributes(resetBoardButton, {
        id: 'button-play-clear', class: 'button',
      });
      resetBoardButton.textContent = 'Play';

      const restartButton = document.createElement('button');
      setAttributes(restartButton, { id: 'button-restart', class: 'button' });
      restartButton.textContent = 'Restart';

      const sliderContainer = document.createElement('div');
      setAttributes(sliderContainer, { id: 'slider-wrapper', class: ['nav', 'nav-slider'] });

      const slider = document.createElement('input');
      setAttributes(slider, {
        type: 'range',
        min: 3,
        max: 8,
        value: state.width,
        class: 'slider',
        id: 'slider-changesize',
      });

      const table = document.createElement('table');
      setAttributes(table, { id: 'table-gameboard', class: 'table' });

      state.board.forEach((row, y) => {
        table.appendChild(this.generateRowToElements(row, y, state.isGameRunning));
      });

      appendChildren(scoreElement,
        [scoreP1, scoreP2]);

      turnElement.appendChild(turnImg);

      appendChildren(gameInfoElement,
        [turnElement,
          scoreElement,
          resetBoardButton,
          restartButton]);

      sliderContainer.appendChild(slider);

      appendChildren(container,
        [header,
          gameInfoElement,
          sliderContainer,
          table]);
    },

    generateRowToElements(row, y, isGameRunning) {
      const rowElement = document.createElement('tr');

      row.forEach((tile, x) => {
        const tileElement = document.createElement('td');

        if (tile.type) {
          const tileImg = document.createElement('img');
          setAttributes(tileImg, {
            src: tile.type === PLAYERX ? X_IMG : O_IMG,
            class: 'img-xo',
          });
          tileElement.appendChild(tileImg);
        }

        if (isGameRunning) {
          tileElement.classList.add('tile', 'tile-active');
        } else {
          tileElement.classList.add('tile');
        }

        setAttributes(tileElement,
          {
            x,
            y,
          });

        rowElement.appendChild(tileElement);
      });

      return rowElement;
    },
  };

  const game = new Game(htmlView);
  controller.listen(game);
}

main();
