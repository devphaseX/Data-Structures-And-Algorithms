import {
  cloneList,
  _isPreSortedBySize,
  rangeLoop,
  createItemEntry,
  swapItem,
  isWithinRange,
} from '../util/index.js';

function getComparisonGap(value: number) {
  return Math.trunc(value / 2);
}

function getSortPass(list: Array<number>) {
  return Math.trunc(Math.log2(list.length));
}

function sortUsingShell(list: Array<number>) {
  list = cloneList(list);
  if (_isPreSortedBySize(list)) {
    return list;
  }

  let gap = getComparisonGap(list.length);
  rangeLoop(0, getSortPass(list), () => {
    rangeLoop(0, list.length - gap, (preGapIndex) => {
      let preElement = list[preGapIndex];
      let gapElement = list[preGapIndex + gap];

      if (preElement > gapElement) {
        swapItem(
          list,
          createItemEntry(preElement, preGapIndex),
          createItemEntry(gapElement, preGapIndex + gap)
        );

        let backwardGap = preGapIndex - gap;
        while (isWithinRange(0, preGapIndex, backwardGap)) {
          let backwardGapElement = list[backwardGap];
          if (gapElement < backwardGapElement) {
            swapItem(
              list,
              createItemEntry(gapElement, preGapIndex),
              createItemEntry(backwardGapElement, backwardGap)
            );
            preGapIndex = backwardGap;
            backwardGap = backwardGap - gap;
          } else {
            break;
          }
        }
      }
    });
    gap = getComparisonGap(gap);
  });

  return list;
}

export default sortUsingShell;
