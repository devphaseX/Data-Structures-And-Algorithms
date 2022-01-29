import {
  getMiddlePoint,
  slice,
  _defaultSort,
  _isPreSortedBySize,
} from './../util/index.js';

type ComparisonPredicate<T> = (dataOne: T, dataTwo: T) => number;
function mergeSort<T>(
  list: Array<T>,
  predicateFn: ComparisonPredicate<T>
): Array<T>;
function mergeSort(list: Array<number>): Array<number>;
function mergeSort<T>(
  list: Array<T>,
  predicateFn?: ComparisonPredicate<T>
): Array<T> {
  if (_isPreSortedBySize(list)) {
    return slice(list, 0);
  }

  function _mergeSort(list: Array<T>, lb: number, ub: number): Array<T> {
    if (ub - lb === 1 || _isPreSortedBySize(list)) {
      return slice(list, lb, ub);
    }
    const middle = getMiddlePoint(lb, ub);
    return merge(_mergeSort(list, lb, middle), _mergeSort(list, middle, ub));
  }

  function merge(sortOne: Array<T>, sortTwo: Array<T>) {
    const mergeSortedList: Array<T> = [];

    while (sortOne.length || sortTwo.length) {
      if (sortOne[0] === undefined || sortTwo[0] === undefined) break;
      let orderValue =
        (predicateFn && predicateFn(sortOne[0], sortTwo[0])) ??
        _defaultSort(sortOne[0] as any, sortTwo[0] as any);

      if (orderValue < 0) {
        mergeSortedList.push(sortOne.shift()!);
      } else {
        mergeSortedList.push(sortTwo.shift()!);
      }
    }
    mergeSortedList.push(...sortOne, ...sortTwo);
    return mergeSortedList;
  }

  return _mergeSort(slice(list, 0), 0, list.length);
}

export default mergeSort;
