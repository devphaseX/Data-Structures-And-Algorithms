import { createItemEntry, swapItem } from '../lib/index.js';
import { slice } from '../util/index.js';

type Order = 'behind' | 'after';

interface BubbleOrder {
  first: Order;
  second: Order;
}

interface BubblePredicateFn<T> {
  (itemOne: T, itemTwo: T): BubbleOrder;
}

function sortByBubble<T>(list: Array<T>, predicateFn: BubblePredicateFn<T>) {
  function _bubbleSort(list: Array<T>, order = list.length - 1): Array<T> {
    if (order < 0) return list;

    list.forEach((item, position) => {
      if (position !== list.length - 1) {
        let nextPosition = position + 1;
        let nextItem = list[nextPosition];

        const currentItemEntry = createItemEntry(item, position);
        const nextItemEntry = createItemEntry(nextItem, nextPosition);

        const sortOrder = predicateFn(item, nextItem);

        const isOrderAscending =
          sortOrder.first === 'after' && sortOrder.second === 'behind';
        const isOrderDescending =
          sortOrder.first === 'behind' && sortOrder.second === 'after';

        if (isOrderAscending) {
          swapItem(list, currentItemEntry, nextItemEntry);
        } else if (isOrderDescending) {
          swapItem(list, nextItemEntry, currentItemEntry);
        }
      }
    });

    return _bubbleSort(list, order - 1);
  }

  return _bubbleSort(slice(list, 0));
}

export default sortByBubble;
