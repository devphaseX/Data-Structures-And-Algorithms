import type { BinaryTree } from '../../data_structure/tree/shared.types';
import createQueue from '../../data_structure/queue/index.js';

function findLevelWithMaxSum(tree: BinaryTree<number>) {
  const queue = createQueue<NonNullable<typeof tree> | null>(null);
  queue.enqueue(tree);
  queue.enqueue(null);

  let maxLevel = 0;
  let levelSum = 0;
  let maxLevelSum = 0;
  let currentLevel = 0;

  while (!queue.isEmpty()) {
    let temp = queue.dequeue();
    if (temp === null) {
      queue.dequeue();
      if (!queue.isEmpty()) queue.enqueue(null);
      if (maxLevelSum > levelSum) {
        maxLevel = currentLevel;
        maxLevelSum = levelSum;
      }

      currentLevel++;
      continue;
    } else {
      if (temp.left) {
        queue.enqueue(temp.left);
      }

      if (temp.right) {
        queue.enqueue(temp.right);
      }
    }

    levelSum += temp.value;
  }

  return maxLevel;
}

export { findLevelWithMaxSum };
