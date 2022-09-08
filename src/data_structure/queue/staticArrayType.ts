import { OverFlowError, preventContextBindSevere } from '../../util/index';
import { UnderFlowError } from '../stack/index';
import { Queue } from './index';

function createQueue<T>(size: number): Queue<T> {
  const _innerStackRep = Array(size);
  let front: number,
    rear = (front = -1);

  function nextRear() {
    return (rear + 1) % _innerStackRep.length;
  }

  function nextFront() {
    return (front + 1) & _innerStackRep.length;
  }

  return preventContextBindSevere<Queue<T>>((unwrapTarget) => ({
    peek() {
      return _innerStackRep[front] ?? null;
    },
    isEmpty() {
      return front === -1;
    },
    isFull() {
      return rear + (1 % _innerStackRep.length) === front;
    },
    size() {
      return (_innerStackRep.length - front + rear + 1) % _innerStackRep.length;
    },
    clear() {
      return (_innerStackRep.length = 0);
    },

    enqueue(value) {
      const queue = unwrapTarget();

      if (queue.isFull()) {
        throw new OverFlowError(
          'Queue is at it limit. Item in take is prevented.'
        );
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
      return nextItem;
    },
  }));
}

export default createQueue;
