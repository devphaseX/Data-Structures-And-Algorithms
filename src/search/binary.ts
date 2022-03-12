import {
  getLogarithmicPass,
  getMiddlePoint,
  positionBasedComparer,
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
  let bound = { low: 0, high: list.length };
  let middlePoint = getMiddlePoint(bound.low, bound.high);

  const comparer = function (a: T, b: typeof bait) {
    if (typeof bait === 'number') {
      return positionBasedComparer(a as any, b as any);
    } else {
      return bait(a);
    }
  };

  rangeLoop(0, getLogarithmicPass(list), (_, __, exit) => {
    switch (comparer(list[middlePoint], bait)) {
      case 0: {
        foundItem = list[middlePoint];
        return exit();
      }

      case 1: {
        bound.low = middlePoint + 1;
        break;
      }

      case -1: {
        bound.high = middlePoint - 1;
      }
    }
  });
  return foundItem;
}
