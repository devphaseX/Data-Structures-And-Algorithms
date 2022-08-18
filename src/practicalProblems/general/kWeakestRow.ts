import { identity } from '../../util/index';

const SOLDIER = 1;
const CIVILIAN = 0;

type Matrix<T> = Array<Array<T>>;
type Soldier = typeof SOLDIER;
type Civilian = typeof CIVILIAN;

type TwoDimensionMatrix = Array<Array<Soldier | Civilian>>;
type RowPosition = number;
type WeakestRow = {
  [weakestOrder: number]: Array<RowPosition>;
  length: number;
};

const matricOrderRule = (
  matrix: Matrix<any>,
  { column, row = matrix.length }: { column: number; row?: number }
) => row === matrix.length && matrix.every((row) => row.length === column);

const getSoldierBoundary = (row: Array<Soldier | Civilian>) =>
  row.lastIndexOf(SOLDIER);

const checkMatricColumnForSameness = (matrix: TwoDimensionMatrix) =>
  matrix.length && matricOrderRule(matrix, { column: matrix[0].length });

function kWeakestRows(matrix: TwoDimensionMatrix) {
  if (!checkMatricColumnForSameness(matrix)) {
    throw new TypeError('You have a row with an incompartible column length.');
  }

  const weakestRows: WeakestRow = {
    length: 0,
  };

  for (let rowPosition = 1; rowPosition < matrix.length; rowPosition++) {
    const prevRow = rowPosition - 1;
    const prevSoldierBound = getSoldierBoundary(matrix[prevRow]);
    const currentSoldierBound = getSoldierBoundary(matrix[rowPosition]);

    if (prevSoldierBound <= currentSoldierBound) {
      let rowPositions = weakestRows[prevSoldierBound];
      if (!rowPositions) rowPositions = weakestRows[prevSoldierBound] = [];
      rowPositions.push(prevRow);
      weakestRows.length++;
    }
  }
  return [].flatMap.call(weakestRows, identity);
}

export default kWeakestRows;
