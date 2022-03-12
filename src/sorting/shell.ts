import {
  cloneList,
  _isPreSortedBySize,
  rangeLoop,
  isWithinRange,
  swapListUsingPosition,
  getListSize,
  pipe,
} from '../util/index.js';

function getComparisonGap(value: number) {
  return Math.trunc(value / 2);
}

const getSortPass = pipe(getListSize, Math.log2, Math.trunc);

function sortUsingShell(list: Array<number>) {
  list = cloneList(list);
  if (_isPreSortedBySize(list)) {
    return list;
  }

  let gap = getComparisonGap(getListSize(list));
  rangeLoop(0, getSortPass(list), () => {
    rangeLoop(0, list.length - gap, (preGapIndex) => {
      let preElement = list[preGapIndex];
      let gapElement = list[preGapIndex + gap];

      if (preElement > gapElement) {
        swapListUsingPosition(list, preGapIndex, preGapIndex + gap);
        let backwardGap = preGapIndex - gap;
        while (isWithinRange(0, preGapIndex, backwardGap)) {
          let backwardGapElement = list[backwardGap];
          if (gapElement < backwardGapElement) {
            swapListUsingPosition(list, preGapIndex, backwardGap);
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
