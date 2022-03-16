import {
  slice,
  lastListItem,
  rangeLoop,
  getItemBoundary,
  getListBoundary,
  _isPreSortedBySize,
  createArrayWithInitial,
  pipe,
  lessThan,
} from './../util/index.js';

export default function countSort(list: Array<number>) {
  if (_isPreSortedBySize(list)) {
    return slice(list, 0);
  }
  const itemBoundary = getListBoundary(list);
  let isNormalizeApplied = false;

  if (lessThan.check(itemBoundary.min, 0)) {
    list = normalizeNegativeValues(list, itemBoundary.min);
    isNormalizeApplied = true;
  }

  const counts = pipe(
    getItemBoundary,
    createItemFrequency.bind(null, list),
    computeItemFreqBoundary
  )(itemBoundary);

  let sortedList = placeItemInSortPositions(list, counts, list.length);

  return isNormalizeApplied
    ? revertNormalizeNegativeValues(sortedList, itemBoundary.min)
    : sortedList;
}

function _negativeNumberNormalizer(rangeSigner: () => number) {
  return function normalizeList(list: Array<number>, lowBound: number) {
    lowBound = rangeSigner() * Math.abs(lowBound);
    return list.map((item) => lowBound + item);
  };
}

const normalizeNegativeValues = _negativeNumberNormalizer(() => 1);
const revertNormalizeNegativeValues = _negativeNumberNormalizer(() => -1);

function placeItemInSortPositions(
  list: Array<number>,
  freqBoundary: Array<number>,
  listSize: number
) {
  const sortedList = createArrayWithInitial(listSize, 0);

  rangeLoop(0, listSize, (i) => {
    const backIndex = listSize - i - 1;
    const item = list[backIndex];
    const itemSortPosition = --freqBoundary[item];

    sortedList[itemSortPosition] = item;
  });

  return sortedList;
}

function createItemFrequency(list: Array<number>, boundary: number) {
  return list.reduce((countRecord, item) => {
    countRecord[item]++;
    return countRecord;
  }, createArrayWithInitial(boundary, 0));
}

function computeItemFreqBoundary(itemFrequency: Array<number>) {
  function calculateBoundary(boundary: Array<number>, freq: number) {
    return [...boundary, lastListItem(boundary) + freq];
  }
  return slice(itemFrequency.reduce(calculateBoundary, [0]), 1);
}
