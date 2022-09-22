import createQueue from '../../queue/index';
import { unwrapNodeTreeValue } from '../shared';
import type { BinaryTree, TreeTraversalFn } from '../shared.types';

const levelorderTraversal = <T>(
  rootTree: BinaryTree<T>,
  cb: TreeTraversalFn<T>
) => {
  const rootMantainedQueue = createQueue<BinaryTree<T>>(null);
  let currentRoot = rootTree as BinaryTree<T> | null;
  rootMantainedQueue.enqueue(rootTree);

  while (!rootMantainedQueue.isEmpty()) {
    currentRoot = rootMantainedQueue.dequeue()!;
    cb(unwrapNodeTreeValue(currentRoot), currentRoot);

    if (currentRoot.left) rootMantainedQueue.enqueue(currentRoot.left);
    if (currentRoot.right) rootMantainedQueue.enqueue(currentRoot.right);
  }
};

export default levelorderTraversal;
