import { Queue } from '../../data_structure/queue/index.js';
import createStack from '../../data_structure/stack/index.js';

function reverseQueue<T>(queue: Queue<T>) {
  const stack = createStack<T>(queue.size);
  while (!queue.isEmpty()) stack.push(queue.dequeue());
  while (!stack.isEmpty()) queue.enqueue(stack.pop());
  return queue;
}

export default reverseQueue;
