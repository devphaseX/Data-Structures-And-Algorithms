import {
  slice,
  lastListItem,
  rangeLoop,
  getItemBoundary,
  getListBoundary,
} from './../util/index.js';

export default function countSort(list: Array<number>) {
  const itemBoundary = getListBoundary(list);
  let isNormalizeApplied = false;

  if (itemBoundary.min < 0) {
    list = normalizeNegativeValues(list, itemBoundary.min);
    isNormalizeApplied = true;
  }

  const counts = computeItemFreqBoundary(
    createItemFrequency(list, getItemBoundary(itemBoundary))
  );

  let sortedList = placeItemInSortPositions(list, counts, list.length);

  return isNormalizeApplied
    ? revertNormalizeNegativeValues(sortedList, itemBoundary.min)
    : sortedList;
}

type Sign = number;
function _makeNegativeNumberSorted(rangeSigner: () => Sign) {
  return function normalizeList(list: Array<number>, lowBound: number) {
    lowBound = rangeSigner() * Math.abs(lowBound);
    return list.map((item) => lowBound + item);
  };
}

const normalizeNegativeValues = _makeNegativeNumberSorted(() => 1);
const revertNormalizeNegativeValues = _makeNegativeNumberSorted(() => -1);

function placeItemInSortPositions(
  list: Array<number>,
  freqBoundary: Array<number>,
  listSize: number
) {
  const sortedList: Array<number> = Array(listSize);

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
  }, Array(boundary).fill(0) as number[]);
}

function computeItemFreqBoundary(itemFrequency: Array<number>) {
  function calculateBoundary(boundary: Array<number>, freq: number) {
    return [...boundary, lastListItem(boundary) + freq];
  }
  return slice(itemFrequency.reduce(calculateBoundary, [0]), 1);
}
