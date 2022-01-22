import heapSort from '../../sorting/heapSort.js';
import { slice } from '../../util/index.js';
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
    if (heapList.length === 1) return;
    heapList = makeChildComplyToHeapStructure(
      slice(heapList, 0),
      order,
      lastItemPosition
    );
  }

  function _delete() {
    if (heapList.length === 0) {
      throw new TypeError("Can't delete from an empty heap.");
    }

    let topMostItem: number;
    if (heapList.length > 1) {
      topMostItem = heapList.splice(0, 1, heapList.pop()!)[0];
    } else {
      topMostItem = heapList.splice(0, 1)[0];
    }
    if (heapList.length > 1) {
      heapList = makeParentComplyToHeapStructure(slice(heapList, 0), order, 0);
    }
    return topMostItem;
  }

  function sort() {
    return heapSort(heapList, order);
  }

  return {
    get heap() {
      return { ...heapList };
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
