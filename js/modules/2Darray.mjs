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
  function iterateOneDiagonal(startRow, startColumn) {
    let row = startRow;
    let column = startColumn;
    const diagonal = [];

    while (!(row > Math.max(startRow, startColumn) || column < 0)) {
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
    const diagonal = iterateOneDiagonal(0, i);
    diagonals.push(diagonal);
  }

  // right vertical row starts at + 1
  for (let i = 1; i < amountOfSquares; i += 1) {
    const diagonal = iterateOneDiagonal(i, amountOfSquares - 1);
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

export {
  fill2DArray, flip2DArrayHorizontal, getAllDiagonals, getAllCombinationsOf2DArray,
};
