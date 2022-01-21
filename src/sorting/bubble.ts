import { createItemEntry, swapItem, slice, rangeLoop } from '../util/index.js';
import { SortPredicateFn } from '../util/type';

function sortByBubble<T>(list: Array<T>, predicateFn: SortPredicateFn<T>) {
  function _bubbleSort(list: Array<T>, order = list.length - 1): Array<T> {
    if (order < 0) return list;

    rangeLoop(0, order, (i, j) => {
      const currentItemEntry = createItemEntry(list[i], i);
      const nextItemEntry = createItemEntry(list[j], j);

      if (predicateFn(currentItemEntry, nextItemEntry)) {
        swapItem(list, currentItemEntry, nextItemEntry);
      }
    });

    return _bubbleSort(list, order - 1);
  }
  return _bubbleSort(slice(list, 0));
}

export default sortByBubble;
