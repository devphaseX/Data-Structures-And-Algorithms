import createStack from '../../data_structure/stack/index.js';
import { iterableLoop } from '../../util/index.js';

function getMinimum(orderList: Array<number>) {
  const minPriorityStack = createStack<number>(null);

  iterableLoop<number>(new Set(orderList), (item) => {
    if (minPriorityStack.isEmpty() || item < minPriorityStack.peek()!) {
      minPriorityStack.push(item);
    }
  });

  return minPriorityStack.pop();
}

export default getMinimum;
