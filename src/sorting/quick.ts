import {
  createItemEntry,
  slice,
  swapItem,
  swapListUsingPosition,
  _isPreSortedBySize,
} from '../util/index.js';

function quickSort(list: Array<number>) {
  if (_isPreSortedBySize(list)) {
    return slice(list, 0);
  }

  function partition(list: Array<number>, low: number, high: number) {
    const pivot = list[low];

    let leftPtr = low;
    let rightPtr = high;

    while (leftPtr < rightPtr) {
      while (list[leftPtr] <= pivot) {
        leftPtr++;
      }

      while (list[rightPtr] > pivot) {
        rightPtr--;
      }

      if (leftPtr < rightPtr) {
        swapListUsingPosition(list, leftPtr, rightPtr);
      }
    }

    const isSwapItemNotPivot = pivot !== list[rightPtr];
    if (isSwapItemNotPivot) swapListUsingPosition(list, low, rightPtr);

    return rightPtr;
  }

  function _quickSort(list: Array<number>, low: number, high: number) {
    if (low < high) {
      const middle = partition(list, low, high);
      _quickSort(list, low, middle - 1);
      _quickSort(list, middle + 1, high);
    }
  }

  list = slice(list, 0);
  return _quickSort(list, 0, list.length - 1), list;
}

export default quickSort;
