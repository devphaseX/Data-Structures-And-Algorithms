import {
  swapListUsingPosition,
  slice,
  rangeLoop,
  _isPreSortedBySize,
  _handleNumericSortBasedPredicate,
  _ascendPredicate,
  cloneList,
  getListSize,
} from '../util/index.js';
import { SortPredicate } from '../util/type';

function sortByBubble<T>(list: Array<T>): Array<T>;
function sortByBubble<T>(list: Array<T>, prediate: SortPredicate<T>): Array<T>;

function sortByBubble<T>(list: Array<T>, predicate?: SortPredicate<T>) {
  if (_isPreSortedBySize(list)) {
    return slice;
  }

  function _bubbleSort(
    list: Array<T>,
    isSortedBeforePassEnd = false,
    order = getListSize(list) - 1
  ): Array<T> {
    if (order < 0 || isSortedBeforePassEnd) return list;

    let swapFlag = 0;
    rangeLoop(0, order, (i, j) => {
      const currentItem = list[i];
      const nextItem = list[j];

      const comparePredicate = predicate || _ascendPredicate;
      if (comparePredicate(currentItem as any, nextItem as any)) {
        swapListUsingPosition(list, i, j);
        swapFlag = 1;
      }
    });

    return _bubbleSort(list, swapFlag === 0, order - 1);
  }

  function _bubbleSortOptimised(list: Array<T>) {
    const size = getListSize(list);
    rangeLoop(0, size - 1, (pass, _, breakLoop) => {
      let swapFlag = 0;

      rangeLoop(0, size - 1 - pass, (i, j) => {
        const currentItem = list[i];
        const nextItem = list[j];

        const comparePredicate = predicate || _ascendPredicate;
        if (comparePredicate(currentItem as any, nextItem as any)) {
          swapListUsingPosition(list, i, j);
          swapFlag = 1;
        }
      });

      if (swapFlag === 0) {
        breakLoop();
      }
    });
    return list;
  }

  list = cloneList(list);

  return getListSize(list) < 100
    ? _bubbleSort(list)
    : _bubbleSortOptimised(list);
}

export default sortByBubble;
