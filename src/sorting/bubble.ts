import { createItemEntry, swapItem, slice, rangeLoop } from '../util/index.js';
import { SortPredicateFn } from '../util/type';

function sortByBubble<T>(list: Array<T>, predicateFn: SortPredicateFn<T>) {
  function _bubbleSort(
    list: Array<T>,
    isSortedBeforePassEnd = false,
    order = list.length - 1
  ): Array<T> {
    if (order < 0 || isSortedBeforePassEnd) return list;

    let swapFlag = 0;
    rangeLoop(0, order, (i, j) => {
      const currentItemEntry = createItemEntry(list[i], i);
      const nextItemEntry = createItemEntry(list[j], j);

      if (predicateFn(currentItemEntry, nextItemEntry)) {
        swapItem(list, currentItemEntry, nextItemEntry);
        swapFlag = 1;
      }
    });

    return _bubbleSort(list, swapFlag === 0, order - 1);
  }

  function _bubbleSortOptimised(list: Array<T>) {
    const size = list.length;
    rangeLoop(0, size - 1, (pass, _, breakLoop) => {
      let swapFlag = 0;

      rangeLoop(0, size - 1 - pass, (i, j) => {
        const currentItemEntry = createItemEntry(list[i], i);
        const nextItemEntry = createItemEntry(list[j], j);

        if (predicateFn(currentItemEntry, nextItemEntry)) {
          swapItem(list, currentItemEntry, nextItemEntry);
          swapFlag = 1;
        }
      });

      if (swapFlag === 0) {
        breakLoop();
      }
    });
    return list;
  }

  return list.length < 100
    ? _bubbleSort(slice(list, 0))
    : _bubbleSortOptimised(slice(list, 0));
}

export default sortByBubble;
