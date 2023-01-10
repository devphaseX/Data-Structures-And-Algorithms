import { BinaryTree } from '../../data_structure/tree/shared.types';
import { iterWithRecurApproach } from '../../util/index';
import createQueue from '../../data_structure/queue/index';

function findTreeHeightRecur(tree: BinaryTree<any> | null | undefined): number {
  if (!tree) return 0;
  const leftHeight = findTreeHeightRecur(tree.left);
  const rightHeight = findTreeHeightRecur(tree.right);
  return Math.max(leftHeight, rightHeight) + 1;
}

function findTreeHeightIter(tree: BinaryTree<any> | null) {
  if (!tree) return 0;
  const queue = createQueue<NonNullable<typeof tree> | null>(null);
  queue.enqueue(tree);
  queue.enqueue(null);

  let height = -1;
  while (!queue.isEmpty()) {
    let temp = queue.dequeue();
    if (temp === null) {
      queue.dequeue();
      if (!queue.isEmpty()) queue.enqueue(null);
      height++;
    } else {
      if (temp.left) {
        queue.enqueue(temp.left);
      }

      if (temp.right) {
        queue.enqueue(temp.right);
      }
    }
  }

  return height;
}

const findTreeHeight = iterWithRecurApproach({
  iter: findTreeHeightIter,
  recur: findTreeHeightRecur,
});

export { findTreeHeight };
