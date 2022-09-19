import {
  equal,
  greaterThan,
  normalizeListableArgs,
  cloneList,
  getListSize,
  hasEmptyList,
  pop,
  unshiftLastItemWithFirst,
  _isPreSortedBySize,
} from './../../util/index.js';
import heapSort from '../../sorting/heapSort.js';

import {
  heapify,
  Heap,
  HeapDataOrder,
  makeChildComplyToHeapStructure,
  makeParentComplyToHeapStructure,
  HEAP_SYMBOL,
  getComparisonFn,
} from './heap.js';

function createHeap(order: HeapDataOrder, data?: number | Array<number>): Heap {
  let heapList: Array<number> =
    (data && heapify(normalizeListableArgs(data), order)) || [];

  function insert(data: number) {
    const lastItemPosition = heapList.length;
    heapList.push(data);

    if (_isPreSortedBySize(heapList)) return;
    heapList = makeChildComplyToHeapStructure(
      heapList,
      getComparisonFn(order),
      lastItemPosition
    );
  }

  function _delete() {
    if (hasEmptyList(heapList)) {
      throw new TypeError("Can't delete from an empty heap.");
    }

    const rootHasDescendant = greaterThan.check(getListSize(heapList), 1);
    let topMostItem: number;

    if (rootHasDescendant) {
      topMostItem = unshiftLastItemWithFirst(heapList)!;
    } else {
      [, topMostItem] = pop(heapList);
    }
    if (rootHasDescendant) {
      heapList = makeParentComplyToHeapStructure(
        heapList,
        getComparisonFn(order),
        0
      );
    }
    return topMostItem;
  }

  function sort() {
    return heapSort(heapList, order);
  }

  return {
    get heap() {
      return cloneList(heapList);
    },
    insert,
    delete: _delete,
    sort,
    get size() {
      return getListSize(heapList);
    },
    type: HEAP_SYMBOL,
  };
}

export default createHeap;
