import {
  cloneList,
  getListSize,
  insertItemAt,
  rangeLoop,
  _isPreSortedBySize,
} from '../util/index.js';

function sortUsingSelection(list: Array<number>) {
  list = cloneList(list);
  if (_isPreSortedBySize(list)) return list;

  const len = getListSize(list);

  rangeLoop(0, len - 1, (sortedEndBound, unsortedStartBound) => {
    let unsortedIndex = unsortedStartBound;
    let minValue = list[unsortedIndex];

    while (unsortedIndex < len - 1) {
      if (list[unsortedIndex] < list[unsortedIndex + 1]) {
        minValue = list[unsortedIndex + 1];
        break;
      }
    }

    insertItemAt(list, minValue, sortedEndBound + 1);
  });

  return list;
}

export default sortUsingSelection;
