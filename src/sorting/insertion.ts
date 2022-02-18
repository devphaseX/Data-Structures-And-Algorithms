import {
  cloneList,
  cloneObject,
  createItemEntry,
  rangeLoop,
  swapItem,
} from '../util/index.js';

function sortUsingInsertion<T>(list: Array<T>) {
  const orderDivisionList: Array<T | null> = cloneList(list);
  if (orderDivisionList.length < 2) {
    return orderDivisionList as Array<T>;
  }

  rangeLoop(1, orderDivisionList.length, (unsortedItemIndex) => {
    let currentUnsortedItem = orderDivisionList[unsortedItemIndex];
    //empty the current selected unsorted item position
    orderDivisionList[unsortedItemIndex] = null;

    let insertionHole = unsortedItemIndex;
    rangeLoop(0, unsortedItemIndex, (currentSortedItemIndex, _, breakLoop) => {
      //normalize the select to the end of the sorted division
      currentSortedItemIndex = unsortedItemIndex - currentSortedItemIndex - 1;

      const currentSortedItem = orderDivisionList[currentSortedItemIndex];

      if (currentSortedItem! > currentUnsortedItem!) {
        swapItem(
          orderDivisionList,
          createItemEntry(null, insertionHole),
          createItemEntry(currentSortedItem, currentSortedItemIndex)
        );
        insertionHole--;
      } else {
        orderDivisionList[insertionHole] = currentUnsortedItem;
        return breakLoop();
      }
    });

    if (orderDivisionList[0] === null) {
      orderDivisionList[0] = currentUnsortedItem;
    }
  });

  return orderDivisionList as Array<T>;
}

export default sortUsingInsertion;
