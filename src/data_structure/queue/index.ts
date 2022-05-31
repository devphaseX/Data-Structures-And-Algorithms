type QueueInitFn<T> = (enqueue: (value: T) => void) => void;
function createQueue<T>(value: T | Array<T> | QueueInitFn<T>) {
  const _innerQueue =
    typeof value !== 'function'
      ? new Set<T>([value].flat(1) as Array<T>)
      : new Set<T>();

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
    while (!isEmpty()) {
      cb(dequeue()!);
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
