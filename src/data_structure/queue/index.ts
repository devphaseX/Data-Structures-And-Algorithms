import { normalizeListableArgs } from '../../util/index.js';

type QueueInitFn<T> = (enqueue: (value: T) => void) => void;
function createQueue<T>(value: T | Array<T> | QueueInitFn<T>) {
  const _innerQueue = new Set<T>(
    typeof value !== 'function' ? normalizeListableArgs(value) : []
  );

  if (typeof value === 'function') {
    (value as QueueInitFn<T>)(enqueue);
  }

  function enqueue(value: T) {
    _innerQueue.add(value);
    return size();
  }

  function dequeue(): T | null {
    if (!size()) return null;
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
    //perform a data flush safety
    let erroredOnFlush = false;
    try {
      while (!isEmpty()) {
        cb(dequeue()!);
      }
    } catch (e) {
      erroredOnFlush = true;
      throw e;
    } finally {
      //clear all remaining if an errored got encountered during flushing.
      if (erroredOnFlush) {
        clear();
      }
    }
  }

  function clear() {
    _innerQueue.clear();
  }

  function peek() {
    let [first] = _innerQueue;
    return first;
  }

  return {
    enqueue,
    dequeue,
    size,
    isEmpty,
    flush,
    clear,
    peek,
  };
}

export default createQueue;
