import { OverFlowError, preventContextBindSevere } from '../../util/index';
import { createSinglyLinkedList } from '../linkedList/singlyLinkedList';
import type { Queue } from './index.js';

function createQueue<T>(
  size: number,
  isResizable?: boolean
): Partial<Queue<T>> {
  return preventContextBindSevere<Queue<T>>((unwrapTarget) => {
    const _queue = createSinglyLinkedList<T>();

    const resize = (resize: number) => {
      if (resize < unwrapTarget().size()) {
        throw new Error();
      }
      size = resize;
    };

    return {
      isFull: () => size === _queue.size,
      clear: () => _queue.emptyLinkedList(),
      peek: () => _queue.getNodeData(1),
      isEmpty: () => _queue.size === 0,
      dequeue: () => {
        const queue = unwrapTarget();
        if (queue.isEmpty!()) {
          throw new OverFlowError(
            'Queue is at it limit. Item in take is prevented.'
          );
        }
        const nextItem = _queue.getNodeData(1)!;
        _queue.removeFirstNode();
        return nextItem;
      },
      enqueue: (value) => {
        const queue = unwrapTarget();
        if (queue.isFull()) {
          if (!isResizable) {
            throw new OverFlowError(
              'Queue is at it limit. Item in take is prevented.'
            );
          }
          resize(size * 2);
        }
        _queue.appendNode(value);
        return queue.size();
      },
      flush(cb) {
        const queue = unwrapTarget();
        try {
          while (!queue.isEmpty()) {
            cb(queue.dequeue());
          }
        } catch (e) {
          queue.clear();
          throw e;
        }
      },
      size() {
        return _queue.size;
      },
    };
  });
}

export default createQueue;
