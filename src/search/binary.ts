import {
  getLogarithmicPass,
  getMiddlePoint,
  rangeLoop,
  _defaultSort,
} from '../util/index';

type BaitPredicate<T> = (item: T) => 0 | 1 | -1;

export function binarySearch(list: Array<number>, item: number): number | null;
export function binarySearch<T>(
  list: Array<T>,
  predicate: BaitPredicate<T>
): T | null;
export function binarySearch<T>(
  list: Array<T>,
  bait: BaitPredicate<T> | number
): T | null {
  let foundItem: T | null = null;
  let bound = { lb: 0, hb: list.length };
  let middlePoint = getMiddlePoint(bound.lb, bound.hb);

  function comparer(item: T) {
    if (typeof bait === 'number') {
      let f = bait as unknown as number;
      if (f === bait) return 0;
      if (f > bait) return 1;
      if (f < bait) return -1;
      throw new TypeError(`Execution shouldn't reach this stage`);
    }
    return bait(item);
  }

  rangeLoop(0, getLogarithmicPass(list), (_, __, exit) => {
    switch (comparer(list[middlePoint])) {
      case 0: {
        foundItem = list[middlePoint];
        return exit();
      }

      case 1: {
        bound.lb = middlePoint + 1;
        break;
      }

      case -1: {
        bound.hb = middlePoint - 1;
        break;
      }
    }
  });
  return foundItem;
}
