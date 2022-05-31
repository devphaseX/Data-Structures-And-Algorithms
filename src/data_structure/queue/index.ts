function createQueue<T>() {
  const _innerQueue = new Set<T>();

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

  return {
    enqueue,
    dequeue,
    size,
    isEmpty,
  };
}

export default createQueue;
