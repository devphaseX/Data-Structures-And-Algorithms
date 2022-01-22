import { rangeLoop, slice } from './../../util/index.js';
import { createItemEntry, swapItem } from '../../util/index.js';
import heapSort from '../../sorting/heapSort.js';

export interface Heap {
  heap: Record<number, number>;
  insert(data: number): void;
  delete(): number;
  sort(): Array<number>;
  readonly size: number;
}

export type HeapDataOrder = 'max' | 'min';
function createHeap(order: HeapDataOrder, data?: number | Array<number>): Heap {
  let heapList: Array<number> = [];

  if (data) {
    heapList = [data].flat(1);
    heapify(heapList, order);
  }

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

function getParentPosition(index: number) {
  if (index === 0) return index;
  return Math.abs(Math.trunc(index / 2) - ((index + 1) % 2));
}

function getLeftChildPosition(parentPosition: number) {
  return parentPosition * 2 + 1;
}

function getRightChildPosition(parentPosition: number) {
  return getLeftChildPosition(parentPosition) + 1;
}

function isFirstArgMin(first: number, second: number) {
  return first <= second;
}

function isFirstArgMax(first: number, second: number) {
  return first >= second;
}

function getComparisonFn(type: HeapDataOrder) {
  return type === 'max' ? isFirstArgMax : isFirstArgMin;
}

function makeParentComplyToHeapStructure(
  currentHeap: Array<number>,
  type: HeapDataOrder,
  parentId: number
): Array<number> {
  const leftChildPosition = getLeftChildPosition(parentId);
  if (leftChildPosition >= currentHeap.length) {
    return currentHeap;
  }
  const rightChildPosition = getRightChildPosition(parentId);

  const selectedChildEntry = getSelectedChildEntry(currentHeap, type, {
    leftPosition: leftChildPosition,
    rightPosition: rightChildPosition,
  });

  const parentEntry = createItemEntry(currentHeap[parentId], parentId);

  if (!getComparisonFn(type)(parentEntry.item, selectedChildEntry.item)) {
    swapItem(currentHeap, parentEntry, selectedChildEntry);
    if (selectedChildEntry.position < currentHeap.length) {
      return makeParentComplyToHeapStructure(
        currentHeap,
        type,
        selectedChildEntry.position
      );
    }
  }

  return currentHeap;
}

function getSelectedChildEntry(
  heapDS: Array<number>,
  type: HeapDataOrder,
  childPosition: {
    leftPosition: number;
    rightPosition: number;
  }
) {
  const { leftPosition, rightPosition } = childPosition;
  return rightPosition < heapDS.length
    ? selectChildEntryByHierachy(heapDS, leftPosition, rightPosition, type)
    : createItemEntry(heapDS[leftPosition], leftPosition);
}

function selectChildEntryByHierachy(
  heapDS: Array<number>,
  itemOnePosition: number,
  itemTwoPosition: number,
  type: HeapDataOrder
) {
  const itemOne = createItemEntry(heapDS[itemOnePosition], itemOnePosition);
  const itemTwo = createItemEntry(heapDS[itemTwoPosition], itemTwoPosition);

  return getComparisonFn(type)(itemOne.item, itemTwo.item) ? itemOne : itemTwo;
}

export default createHeap;

function heapify(list: Array<number>, order: HeapDataOrder) {
  if (list.length === 1) return list;
  const endOfNonLeaveItem = Math.trunc(list.length / 2);
  rangeLoop(0, endOfNonLeaveItem + 1, (i) => {
    makeParentComplyToHeapStructure(list, order, endOfNonLeaveItem - i);
  });
  return list;
}

export { heapify };
