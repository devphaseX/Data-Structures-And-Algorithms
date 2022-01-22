import { slice } from './../../util/index.js';
import { createItemEntry, swapItem } from '../../util/index.js';
import heapSort from '../../sorting/heapSort.js';

interface Heap {
  heap: Record<number, number>;
  insert(data: number): void;
  delete(position: number): number;
  sort(order: HeapDataOrder): Array<number>;
}

type HeapDataOrder = 'max' | 'min';
function createHeap(order: HeapDataOrder, data?: number): Heap {
  let heapList: Array<number> = [];
  data && heapList.push(data);

  function insert(data: number) {
    const lastItemPosition = heapList.length;
    heapList.push(data);
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

  function getParentPosition(index: number) {
    return Math.abs(Math.trunc(index / 2));
  }

  function makeParentComplyToHeapStructure(
    currentHeap: Array<number>,
    type: HeapDataOrder,
    parentId: number
  ): Array<number> {
    function getLeftChildPosition(parentPosition: number) {
      return parentPosition * 2 + 1;
    }

    function getRightChildPosition(parentPosition: number) {
      return getLeftChildPosition(parentPosition) + 1;
    }

    function selectChildEntryByStructure(
      itemOnePosition: number,
      itemTwoPosition: number,
      type: HeapDataOrder
    ) {
      const itemOne = createItemEntry(
        currentHeap[itemOnePosition],
        itemOnePosition
      );
      const itemTwo = createItemEntry(
        currentHeap[itemTwoPosition],
        itemTwoPosition
      );

      if (type === 'max') {
        return itemOne.item > itemTwo.item ? itemOne : itemTwo;
      } else {
        return itemOne.item < itemTwo.item ? itemOne : itemTwo;
      }
    }

    const leftChildPosition = getLeftChildPosition(parentId);
    const rightChildPosition = getRightChildPosition(parentId);

    if (leftChildPosition >= heapList.length) {
      return currentHeap;
    }

    const selectedChildEntry =
      rightChildPosition < heapList.length
        ? selectChildEntryByStructure(
            leftChildPosition,
            rightChildPosition,
            type
          )
        : createItemEntry(currentHeap[leftChildPosition], leftChildPosition);

    const parentEntry = createItemEntry(currentHeap[parentId], parentId);

    if (!getComparisonFn(type)(parentEntry.item, selectedChildEntry.item)) {
      swapItem(currentHeap, parentEntry, selectedChildEntry);
      if (selectedChildEntry.position < heapList.length) {
        return makeParentComplyToHeapStructure(
          currentHeap,
          type,
          selectedChildEntry.position
        );
      }
    }

    return currentHeap;
  }

  function isParentMin(parent: number, child: number) {
    return parent <= child;
  }

  function isParentMax(parent: number, child: number) {
    return parent >= child;
  }

  function getComparisonFn(type: HeapDataOrder) {
    return type === 'max' ? isParentMax : isParentMin;
  }

  function makeChildComplyToHeapStructure(
    currentHeap: Array<number>,
    type: HeapDataOrder,
    newlyItemIndex: number
  ): Array<number> {
    const parentId = getParentPosition(newlyItemIndex);
    const parent = currentHeap[parentId];
    const child = currentHeap[newlyItemIndex];

    const comparisonFnType = getComparisonFn(type);

    if (!comparisonFnType(parent, child)) {
      swapItem(
        currentHeap,
        createItemEntry(parent, parentId),
        createItemEntry(child, newlyItemIndex)
      );

      if (parentId > 0) {
        return makeChildComplyToHeapStructure(currentHeap, type, parentId);
      }
    }

    return currentHeap;
  }

  function sort(order: HeapDataOrder) {
    return heapSort(heapList, order === 'max' ? 0 : 1);
  }

  return {
    get heap() {
      return { ...heapList };
    },
    insert,
    delete: _delete,
    sort,
  };
}

export default createHeap;

function heapify(list: Array<number>, order: HeapDataOrder) {
  const heap = createHeap(order);
  list.forEach((item) => {
    heap.insert(item);
  });

  return heap;
}

export { heapify };
