import {
  cloneList,
  getListSize,
  rangeLoop,
  _isPreSortedBySize,
  swapListUsingPosition,
} from '../util/index.js';

function sortUsingSelection(list: Array<number>) {
  list = cloneList(list);
  if (_isPreSortedBySize(list)) return list;

  const len = getListSize(list);

  rangeLoop(0, len - 1, (sortedEndBound) => {
    let min = list[sortedEndBound];
    let pointer = { min: sortedEndBound, nav: sortedEndBound };

    while (pointer.nav < len) {
      if (list[pointer.nav] < min) {
        min = list[pointer.nav];
        pointer.min = pointer.nav;
      }

      pointer.nav += 1;
    }

    if (pointer.min !== sortedEndBound) {
      swapListUsingPosition(list, sortedEndBound, pointer.min);
    }
  });

  return list;
}

export default sortUsingSelection;
