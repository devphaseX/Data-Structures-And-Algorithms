import createQueue from '../../data_structure/queue/index';
import createStack from '../../data_structure/stack/index';
import { unwrapNodeTreeValue } from '../../data_structure/tree/shared';
import { BinaryTree } from '../../data_structure/tree/shared.types';

function printLevelOrderInReverse<T>(
  tree: BinaryTree<T>,
  logger: (value: T) => void
) {
  const reverseStoredItem = createStack<T>(null);
  const leveledQueue = createQueue<typeof tree>(null);

  let traverseTree = tree;
  leveledQueue.enqueue(traverseTree);

  while (!leveledQueue.isEmpty()) {
    let currentProcessedTree = leveledQueue.dequeue();

    if (currentProcessedTree.right) {
      leveledQueue.enqueue(currentProcessedTree.right);
    }

    if (currentProcessedTree.left) {
      leveledQueue.enqueue(currentProcessedTree.left);
    }

    reverseStoredItem.push(unwrapNodeTreeValue(currentProcessedTree));
  }

  reverseStoredItem.flush(logger);
}

export default printLevelOrderInReverse;
