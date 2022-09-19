import createStack, { Stack } from '../../data_structure/stack/index.js';
import { OverFlowError, UnderFlowError } from '../../util/index.js';

function createQueueUsingStack<T>(size: number, isResizable?: boolean) {
  const s1 = createStack<T>(null, size);
  const s2 = createStack<T>(null, size);

  const getQueueSize = () => s1.size + s2.size;
  const resize = () => size * 2;

  const isEmpty = () => s1.isEmpty() && s2.isEmpty();
  const shiftStackItem = (s1: Stack<T>, s2: Stack<T>) => s1.flush(s2.push);

  function enqueue(value: T) {
    let hasOverFlow = false;
    if ((hasOverFlow = getQueueSize() === size) && !isResizable) {
      throw new OverFlowError('Removing item from an empty is queue is void.');
    }

    if (hasOverFlow) resize();
    s1.push(value);
  }

  function dequeue(): T {
    if (isEmpty()) {
      throw new UnderFlowError(
        'Queue is at it limit. Item in take is prevented.'
      );
    }

    if (s2.isEmpty()) shiftStackItem(s1, s2);
    return s2.pop();
  }

  return {
    enqueue,
    dequeue,
  };
}

export default createQueueUsingStack;
