import {
  cloneList,
  _isPreSortedBySize,
  rangeLoop,
  createItemEntry,
  swapItem,
  isWithinRange,
} from '../util/index.js';

function getComparisonGap(value: Array<any> | number) {
  if (Array.isArray(value)) {
    return Math.trunc(Math.log2(value.length));
  } else {
    return Math.trunc(value / 2);
  }
}

function sortUsingShell(list: Array<number>) {
  list = cloneList(list);
  if (_isPreSortedBySize(list)) {
    return list;
  }

  let gap = getComparisonGap(list.length);
  rangeLoop(0, getComparisonGap(list), () => {
    rangeLoop(0, list.length - gap, (i) => {
      let preElement = list[i];
      let gapElement = list[i + gap];

      if (preElement > gapElement) {
        swapItem(
          list,
          createItemEntry(preElement, i),
          createItemEntry(gapElement, i + gap)
        );

        let backwardGap = i - gap;
        if (isWithinRange(0, list.length, backwardGap)) {
          while (backwardGap > -1) {
            if (gapElement < list[backwardGap]) {
              swapItem(
                list,
                createItemEntry(gapElement, i),
                createItemEntry(list[backwardGap], backwardGap)
              );
              i = backwardGap;
              backwardGap = backwardGap - gap;
            } else {
              break;
            }
          }
        }
      }
    });
    gap = getComparisonGap(gap);
  });

  return list;
}

export default sortUsingShell;
