import { BinaryTree } from '../../data_structure/tree/shared.types';
import createQueue from '../../data_structure/queue';

function findInternalFullNodes<T>(tree: BinaryTree<T>) {
  const queue = createQueue<NonNullable<typeof tree> | null>(null);
  queue.enqueue(tree);
  queue.enqueue(null);
  const leaves: Array<typeof tree> = [];

  while (!queue.isEmpty()) {
    let temp = queue.dequeue();
    if (temp && temp.left && temp.right) leaves.push(temp);
    if (temp === null) {
      queue.dequeue();
      if (!queue.isEmpty()) queue.enqueue(null);
    } else {
      if (temp.left) {
        queue.enqueue(temp.left);
      }

      if (temp.right) {
        queue.enqueue(temp.right);
      }
    }
  }

  return leaves;
}

export { findInternalFullNodes };
