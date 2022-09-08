import { OverFlowError, preventContextBindSevere } from '../../util/index.js';
import { UnderFlowError } from '../stack/index.js';
import { Queue } from './index.js';

type QueueResizeOption = {
  rear: number;
  front: number;
  size: number;
};

type QueueResizeResult = {
  nextRear: number;
  size: number;
};

function resizeQueue<T>(
  resize: number,
  queue: Queue<T>,
  options: QueueResizeOption
): QueueResizeResult {
  if (resize < queue.size()) throw new Error();
  const { front, rear, size } = options;
  if (front > rear) {
    const rearItems = [] as Array<T>;
    Array.from({ length: rear }, () => {
      rearItems.push(queue.dequeue());
    });
    rearItems.forEach((item) => queue.enqueue(item));
  }

  return { nextRear: rear + size, size: resize };
}

function _createQueue<T>(size: number, isResizable?: boolean): Queue<T> {
  return preventContextBindSevere<Queue<T>>((unwrapTarget) => {
    const _innerStackRep = new Array<T | null>(size).fill(null);
    let front: number,
      rear = (front = -1);

    const nextRear = () => (rear + 1) % size;
    const nextFront = () => (front + 1) % size;

    function resize(resize: number) {
      if (resize < unwrapTarget().size()) throw new Error();
      ({ nextRear: rear, size } = resizeQueue(resize, unwrapTarget(), {
        front,
        rear,
        size,
      }));
      return true;
    }

    return {
      peek() {
        return _innerStackRep[front] ?? null;
      },
      isEmpty() {
        return front === -1;
      },
      isFull() {
        return (rear + 1) % size === front;
      },
      size() {
        return ((size - front + rear) % size) + 1;
      },
      clear() {
        return (size = 0);
      },

      enqueue(value) {
        const queue = unwrapTarget();

        if (queue.isFull()) {
          if (!isResizable) {
            throw new OverFlowError(
              'Queue is at it limit. Item in take is prevented.'
            );
          }
          resize(size * 2);
        }
        rear = nextRear();
        _innerStackRep[rear] = value;
        if (front === -1) front = rear;
        return queue.size();
      },

      flush(cb) {
        const queue = unwrapTarget();
        try {
          while (!queue.isEmpty()) {
            cb(queue.dequeue()!);
          }
        } catch (e) {
          queue.clear();
          throw e;
        }
      },
      dequeue() {
        if (unwrapTarget().isEmpty()) {
          throw new UnderFlowError(
            'Removing item from an empty is queue is void.'
          );
        }

        const nextItem = _innerStackRep[front];

        if (front === rear) {
          front = rear = -1;
        } else {
          front = nextFront();
        }
        return nextItem!;
      },
    };
  });
}

export default _createQueue;
export { resizeQueue };
