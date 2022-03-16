import heapSort from '../../sorting/heapSort.js';
import {
  cloneList,
  getListSize,
  hasEmptyList,
  pop,
  unshiftLastItemWithFirst,
} from '../../util/index.js';

import {
  heapify,
  Heap,
  HeapDataOrder,
  makeChildComplyToHeapStructure,
  makeParentComplyToHeapStructure,
} from './heap.js';

function createHeap(order: HeapDataOrder, data?: number | Array<number>): Heap {
  let heapList: Array<number> = (data && heapify([data].flat(1), order)) || [];

  function insert(data: number) {
    const lastItemPosition = heapList.length;
    heapList.push(data);
    if (getListSize(heapList) === 1) return;
    heapList = makeChildComplyToHeapStructure(
      heapList,
      order,
      lastItemPosition
    );
  }

  function _delete() {
    if (hasEmptyList(heapList)) {
      throw new TypeError("Can't delete from an empty heap.");
    }

    const doesRootHasChild = () => getListSize(heapList) > 1;

    let topMostItem: number;
    let isRootParent = doesRootHasChild();

    if (isRootParent) {
      topMostItem = unshiftLastItemWithFirst(heapList);
    } else {
      [, topMostItem] = pop(heapList);
    }
    if (isRootParent) {
      heapList = makeParentComplyToHeapStructure(heapList, order, 0);
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
      return heapList.length;
    },
  };
}

export default createHeap;
