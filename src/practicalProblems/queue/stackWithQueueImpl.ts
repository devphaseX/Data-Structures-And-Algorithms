import { Queue } from '../../data_structure/queue/index.js';
import createQueue from '../../data_structure/queue/linkedListType.js';
import { OverFlowError, UnderFlowError } from '../../util/index.js';

function createStackUsingQueue<T>(size: number, isResizable?: boolean) {
  const q1 = createQueue<T>(size);
  const q2 = createQueue<T>(size);

  const returnLastQueueItem = (q1: Queue<T>, q2: Queue<T>) => {
    if (q1.isEmpty()) return null;
    while (!q1.isEmpty() && q1.size() !== 1) q2.enqueue(q1.dequeue());
    let item = q1.dequeue()!;
    q2.flush(q1.enqueue);
    return item;
  };

  const resize = () => (size = size * 2);
  function peek() {
    let isQ2Empty = false;
    const lastInserted =
      (isQ2Empty = q2.isEmpty()) && !q1.isEmpty()
        ? returnLastQueueItem(q1, q2)
        : !q2.isEmpty()
        ? returnLastQueueItem(q2, q1)
        : null;

    if (!lastInserted) return lastInserted;
    if (isQ2Empty) q1.enqueue(lastInserted);
    else q2.enqueue(lastInserted);

    return lastInserted;
  }

  function pop() {
    let isQ2Empty = false;
    const lastInserted =
      (isQ2Empty = q2.isEmpty()) && !q1.isEmpty()
        ? returnLastQueueItem(q1, q2)
        : !q2.isEmpty()
        ? returnLastQueueItem(q2, q1)
        : null;

    if (!lastInserted) {
      throw new UnderFlowError('Cannot pop data off an empty stack');
    }
    if (isQ2Empty) q1.dequeue();
    else q2.dequeue();
    return lastInserted;
  }

  function push(value: T) {
    let hasOverFlow = false;
    if (
      (hasOverFlow = q1.size() === size || q2.size() === size) &&
      !isResizable
    ) {
      throw new OverFlowError(
        `Cannot insert data in a size limit stack of size(${size})`
      );
    }

    if (hasOverFlow) resize();
    if (q1.isEmpty()) q1.enqueue(value);
    else if (q2.isEmpty()) q2.enqueue(value);
    else
      throw new Error(
        'Both queue should not contain item. This is an internal bug'
      );

    return q1.size();
  }

  return {
    peek,
    pop,
    push,
  };
}

export default createStackUsingQueue;
