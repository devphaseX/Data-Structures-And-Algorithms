import {
  createItemEntry,
  getListSize,
  pipe,
  rangeLoop,
  swapListUsingPosition,
  greaterThan,
  lessThan,
  compare,
  equal,
} from './../../util/index.js';

type ComparisonFn<V> = (itemOne: V, itemTwo: V) => boolean;
type ChildNodePosition = {
  left: number;
  right: number;
};
export const HEAP_SYMBOL = Symbol(
  `HEAP_${Math.random().toString(32).slice(2)}`
);

export interface Heap {
  heap: Array<number>;
  insert(data: number): void;
  delete(): number;
  sort(): Array<number>;
  readonly size: number;
  readonly type: typeof HEAP_SYMBOL;
}

export type HeapDataOrder = 'max' | 'min';

export function makeChildComplyToHeapStructure(
  currentHeap: Array<number>,
  comparisonFn: ComparisonFn<number>,
  newlyItemIndex: number
): Array<number> {
  const parentId = getParentPosition(newlyItemIndex);
  const parent = currentHeap[parentId];
  const child = currentHeap[newlyItemIndex];

  if (!comparisonFn(parent, child)) {
    swapListUsingPosition(currentHeap, parentId, newlyItemIndex);

    if (greaterThan.check(parentId, 0)) {
      return makeChildComplyToHeapStructure(
        currentHeap,
        comparisonFn,
        parentId
      );
    }
  }

  return currentHeap;
}

export function getParentPosition(index: number) {
  if (equal.check(index, 0)) return index;
  return pipe(Math.trunc, Math.abs)(index / 2) - ((index + 1) % 2);
}

export function getLeftChildPosition(parentPosition: number) {
  return parentPosition * 2 + 1;
}

export function getRightChildPosition(parentPosition: number) {
  return getLeftChildPosition(parentPosition) + 1;
}

export function getComparisonFn(type: HeapDataOrder) {
  return (equal.check(type, 'max') ? greaterThan.equal : lessThan.equal).check;
}

export function makeParentComplyToHeapStructure(
  currentHeap: Array<number>,
  comparisonFn: ComparisonFn<number>,
  parentId: number
): Array<number> {
  const leftChildPosition = getLeftChildPosition(parentId);
  const heapSize = getListSize(currentHeap);

  if (greaterThan.equal.check(leftChildPosition, heapSize)) {
    return currentHeap;
  }
  const rightChildPosition = getRightChildPosition(parentId);

  const { item: childItem, position: childPosition } = getSelectedChildEntry(
    currentHeap,
    comparisonFn,
    {
      left: leftChildPosition,
      right: rightChildPosition,
    }
  );

  {
    const parentItem = currentHeap[parentId];

    if (!comparisonFn(parentItem, childItem)) {
      swapListUsingPosition(currentHeap, parentId, childPosition);

      if (compare.lessThan.check(childPosition, heapSize)) {
        return makeParentComplyToHeapStructure(
          currentHeap,
          comparisonFn,
          childPosition
        );
      }
    }
  }

  return currentHeap;
}

export function getSelectedChildEntry(
  heapDS: Array<number>,
  comparisonFn: ComparisonFn<number>,
  childPosition: ChildNodePosition
) {
  const { left, right } = childPosition;

  return lessThan.check(right, getListSize(heapDS))
    ? chooseComparisonChildNode(heapDS, left, right, comparisonFn)
    : createItemEntry(heapDS[left], right);
}

export function chooseComparisonChildNode(
  heapDS: Array<number>,
  itemOnePosition: number,
  itemTwoPosition: number,
  comparisonFn: ComparisonFn<number>
) {
  const itemOne = createItemEntry(heapDS[itemOnePosition], itemOnePosition);
  const itemTwo = createItemEntry(heapDS[itemTwoPosition], itemTwoPosition);

  return comparisonFn(itemOne.item, itemTwo.item) ? itemOne : itemTwo;
}

function heapify(list: Array<number>, order: HeapDataOrder) {
  let length = getListSize(list);
  if (compare.equal.check(length, 1)) return list;

  const endOfNonLeaveItem = Math.trunc(length / 2);
  rangeLoop(0, endOfNonLeaveItem + 1, (i) => {
    makeParentComplyToHeapStructure(
      list,
      getComparisonFn(order),
      endOfNonLeaveItem - i
    );
  });
  return list;
}

export { heapify };
