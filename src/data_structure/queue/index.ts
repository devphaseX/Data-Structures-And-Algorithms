import {
  normalizeListableArgs,
  OverFlowError,
  UnderFlowError,
} from '../../util/index.js';

interface Queue<T> {
  enqueue(value: T): number;
  dequeue(): T;
  size(): number;
  isEmpty(): boolean;
  flush(cb: (value: T) => void): void;
  clear(): void;
  peek(): T | null;
  isFull(): boolean;
}

type QueueInitFn<T> = (
  enqueue: (value: T) => void,
  setInnetQueueSize: (size: number) => void
) => void;
function createQueue<T>(
  value: T | Array<T> | QueueInitFn<T> | null,
  boundary?: number
): Queue<T> {
  const _innerQueue = new Set<T>(
    typeof value !== 'function' && value !== null
      ? normalizeListableArgs(value)
      : []
  );

  if (typeof value === 'function') {
    (value as QueueInitFn<T>)(enqueue, (size) => {
      boundary = size;
    });
  }

  function enqueue(value: T) {
    if (boundary && boundary === size()) {
      throw new OverFlowError('Removing item from an empty is queue is void.');
    }
    _innerQueue.add(value);
    return size();
  }

  function dequeue(): T {
    if (isEmpty()) {
      throw new UnderFlowError(
        'Queue is at it limit. Item in take is prevented.'
      );
    }
    const [next] = _innerQueue;
    _innerQueue.delete(next);
    return next;
  }

  function size() {
    return _innerQueue.size;
  }

  function isEmpty() {
    return size() === 0;
  }

  function flush(cb: (value: T) => void) {
    try {
      while (!isEmpty()) {
        cb(dequeue()!);
      }
    } catch (e) {
      clear();
      throw e;
    }
  }

  function clear() {
    _innerQueue.clear();
  }

  function peek() {
    let [first] = _innerQueue;
    return first;
  }

  function isFull() {
    return !!boundary && boundary === _innerQueue.size;
  }

  return {
    enqueue,
    dequeue,
    size,
    isEmpty,
    flush,
    clear,
    peek,
    isFull,
  };
}

export default createQueue;

export type { Queue };
