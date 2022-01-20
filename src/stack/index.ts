import { createDoublyLinkedList } from '../linkedList/index.js';

interface Stack<T> {
  push(value: T): number;
  pop(): T | null;
  peek(): T | null;
  empty(): void;
  isEmpty(): boolean;
  isFull(): boolean;
  stackEntries(): Array<T>;
  size: number;
  forEach(cb: (value: T, index: number) => void): void;
}

export class UnderFlowError extends Error {}
export class OverFlowError extends Error {}

function createStack<T>(type: T | null, size?: number): Stack<T> {
  const _innerStack = createDoublyLinkedList<T>(type ?? undefined);

  function push(value: T) {
    if (_innerStack.size === size) {
      throw new OverFlowError('Cannot insert data in a size limit stack');
    }
    _innerStack.appendNode(value);
    return _innerStack.size;
  }

  function pop(): T {
    if (_innerStack.size) {
      const lastNodeData = peek();
      _innerStack.removeLastNode();
      return lastNodeData!;
    }

    throw new UnderFlowError('Cannot pop data off an empty stack');
  }

  function empty() {
    _innerStack.emptyLinkedList();
  }

  function peek(): T | null {
    let lastNodeIndex = _innerStack.size;
    return _innerStack.getNodeData(lastNodeIndex);
  }

  function stackEntries() {
    return _innerStack.getNodeList();
  }

  function isFull() {
    return _innerStack.size === size;
  }

  function isEmpty() {
    return _innerStack.size === 0;
  }

  function forEach(cb: (value: T, index: number) => void) {
    return void _innerStack.forEach(cb, 'tail');
  }

  return {
    push,
    pop,
    peek,
    empty,
    isFull,
    isEmpty,
    stackEntries,
    forEach,
    get size() {
      return _innerStack.size;
    },
  };
}

export default createStack;
