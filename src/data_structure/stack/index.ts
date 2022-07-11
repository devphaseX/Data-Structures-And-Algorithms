import {
  binary,
  equal,
  isBoolean,
  isFunction,
  normalizeListableArgs,
  unwrapIterable,
} from '../../util/index.js';

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
type StackFillerFn<T> = (push: Stack<T>['push']) => true | number;

type InnerStackSize = number;
function hasDetectOverFlow(
  capacity: number,
  getInnerStackSize: () => InnerStackSize
) {
  return getInnerStackSize() > capacity;
}

function createStack<T>(
  value: T | Array<T> | StackFillerFn<T> | null,
  capacity: number
): Stack<T> {
  if (
    hasDetectOverFlow(capacity, () => (Array.isArray(value) ? value.length : 1))
  ) {
    throw new TypeError();
  }

  const _innerStack = (
    value && typeof value !== 'function' ? normalizeListableArgs(value) : []
  ) as Array<T>;

  if (isFunction(value)) {
    const length = (value as StackFillerFn<T>)(push);
    if (isBoolean(length)) {
      capacity = _innerStack.length;
    } else {
      if ((length as number) < _innerStack.length) {
        throw new TypeError();
      }
      capacity = length as number;
    }
  }

  function _getInnerStackSize() {
    return _innerStack.length;
  }

  function push(value: T) {
    if (equal.check(_getInnerStackSize(), capacity)) {
      throw new OverFlowError(
        `Cannot insert data in a size limit stack of size(${capacity})`
      );
    }
    _innerStack.push(value);
    return _getInnerStackSize();
  }

  function pop(): T {
    if (empty()) {
      throw new UnderFlowError('Cannot pop data off an empty stack');
    }
    const lastNodeData = _innerStack.pop();
    return lastNodeData!;
  }

  function empty() {
    return _innerStack.length === 0;
  }

  function peek(): T | null {
    let lastNodeIndex = _innerStack.length - 1;
    return _innerStack[lastNodeIndex];
  }

  function stackEntries() {
    return unwrapIterable(_innerStack);
  }

  function isFull() {
    return _innerStack.length === capacity;
  }

  function isEmpty() {
    return _innerStack.length === 0;
  }

  function forEach(cb: (value: T, index: number) => void) {
    return void _innerStack.forEach(binary(cb));
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
      return _getInnerStackSize();
    },
  };
}

export default createStack;
