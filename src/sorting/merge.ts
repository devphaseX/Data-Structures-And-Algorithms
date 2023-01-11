import {
  equal,
  getListSize,
  getMiddlePoint,
  slice,
  _defaultSort,
  _isPreSortedBySize,
  getListFirstItem,
} from './../util/index.js';

type ComparisonPredicate<T> = (dataOne: T, dataTwo: T) => number;
function mergeSort<T>(
  list: Array<T>,
  predicateFn: ComparisonPredicate<T>
): Array<T>;
function mergeSort<T>(list: Array<T>): Array<T>;
function mergeSort<T>(
  list: Array<T>,
  predicateFn?: ComparisonPredicate<T>
): Array<T> {
  if (_isPreSortedBySize(list)) {
    return slice(list, 0);
  }

  function _mergeSort(list: Array<T>, lb: number, ub: number): Array<T> {
    if (equal.check(ub - lb, 1) || _isPreSortedBySize(list)) {
      return slice(list, lb, ub);
    }
    const middle = getMiddlePoint(lb, ub);
    return merge(_mergeSort(list, lb, middle), _mergeSort(list, middle, ub));
  }

  const _predicateFn =
    predicateFn ?? (_defaultSort as unknown as ComparisonPredicate<T>);
  function validateSortItem(item: T) {
    if (_predicateFn !== predicateFn && typeof item !== 'number') {
      throw new Error(`A predicate function is needed inorder to resolve item placement order; default [__internal__] predicate
                       is only applicable to to value of numeric type`);
    }
  }

  validateSortItem(getListFirstItem(list));

  function merge(sortOne: Array<T>, sortTwo: Array<T>) {
    const mergeSortedList: Array<T> = [];

    let sortOneCurrentIndex = 0;
    let sortTwoCurrentIndex = 0;
    const max_bound = Math.max(getListSize(sortOne), getListSize(sortTwo));

    for (let i = 0; i < max_bound; i++) {
      validateSortItem(sortOne[sortOneCurrentIndex]);
      validateSortItem(sortTwo[sortTwoCurrentIndex]);

      if (
        _predicateFn(
          sortOne[sortOneCurrentIndex],
          sortTwo[sortTwoCurrentIndex]
        ) < 1
      ) {
        mergeSortedList.push(sortOne[sortOneCurrentIndex]);
        sortOneCurrentIndex++;
      } else {
        mergeSortedList.push(sortTwo[sortTwoCurrentIndex]);
        sortTwoCurrentIndex++;
      }
    }

    mergeSortedList.push.apply(
      null,
      max_bound === sortOneCurrentIndex
        ? sortTwo.slice(sortTwoCurrentIndex)
        : sortOne.slice(sortOneCurrentIndex)
    );

    return mergeSortedList;
  }

  return _mergeSort(slice(list, 0), 0, list.length);
}

export default mergeSort;
