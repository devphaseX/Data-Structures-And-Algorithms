import {
  createItemEntry,
  pipe,
  rangeLoop,
  swapItem,
  swapListUsingPosition,
} from './../../util/index.js';

export interface Heap {
  heap: Record<number, number>;
  insert(data: number): void;
  delete(): number;
  sort(): Array<number>;
  readonly size: number;
}

export type HeapDataOrder = 'max' | 'min';

export function makeChildComplyToHeapStructure(
  currentHeap: Array<number>,
  type: HeapDataOrder,
  newlyItemIndex: number
): Array<number> {
  const parentId = getParentPosition(newlyItemIndex);
  const parent = currentHeap[parentId];
  const child = currentHeap[newlyItemIndex];

  const comparisonFnType = getComparisonFn(type);

  if (!comparisonFnType(parent, child)) {
    swapListUsingPosition(currentHeap, parentId, newlyItemIndex);

    if (parentId > 0) {
      return makeChildComplyToHeapStructure(currentHeap, type, parentId);
    }
  }

  return currentHeap;
}

export function getParentPosition(index: number) {
  if (index === 0) return index;
  return pipe(Math.trunc, Math.abs)(index / 2) - ((index + 1) % 2);
}

export function getLeftChildPosition(parentPosition: number) {
  return parentPosition * 2 + 1;
}

export function getRightChildPosition(parentPosition: number) {
  return getLeftChildPosition(parentPosition) + 1;
}

export function isFirstArgMin(first: number, second: number) {
  return first <= second;
}

export function isFirstArgMax(first: number, second: number) {
  return first >= second;
}

export function getComparisonFn(type: HeapDataOrder) {
  return type === 'max' ? isFirstArgMax : isFirstArgMin;
}

export function makeParentComplyToHeapStructure(
  currentHeap: Array<number>,
  type: HeapDataOrder,
  parentId: number
): Array<number> {
  const leftChildPosition = getLeftChildPosition(parentId);
  if (leftChildPosition >= currentHeap.length) {
    return currentHeap;
  }
  const rightChildPosition = getRightChildPosition(parentId);

  const { item: childItem, position: childPosition } = getSelectedChildEntry(
    currentHeap,
    type,
    {
      leftPosition: leftChildPosition,
      rightPosition: rightChildPosition,
    }
  );

  {
    const parentItem = currentHeap[parentId];

    if (!getComparisonFn(type)(parentItem, childItem)) {
      swapListUsingPosition(currentHeap, parentId, childPosition);

      if (childPosition < currentHeap.length) {
        return makeParentComplyToHeapStructure(
          currentHeap,
          type,
          childPosition
        );
      }
    }
  }

  return currentHeap;
}

export function getSelectedChildEntry(
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

export function selectChildEntryByHierachy(
  heapDS: Array<number>,
  itemOnePosition: number,
  itemTwoPosition: number,
  type: HeapDataOrder
) {
  const itemOne = createItemEntry(heapDS[itemOnePosition], itemOnePosition);
  const itemTwo = createItemEntry(heapDS[itemTwoPosition], itemTwoPosition);

  return getComparisonFn(type)(itemOne.item, itemTwo.item) ? itemOne : itemTwo;
}

function heapify(list: Array<number>, order: HeapDataOrder) {
  if (list.length === 1) return list;
  const endOfNonLeaveItem = Math.trunc(list.length / 2);
  rangeLoop(0, endOfNonLeaveItem + 1, (i) => {
    makeParentComplyToHeapStructure(list, order, endOfNonLeaveItem - i);
  });
  return list;
}

export { heapify };
