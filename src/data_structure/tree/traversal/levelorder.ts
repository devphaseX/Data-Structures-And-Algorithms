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

interface ExitableTraversalOption {
  exit(): void;
}

interface ExitableTraversalFn<T> extends TreeTraversalFn<T> {
  (value: T, raw: BinaryTree<T>, options: ExitableTraversalOption): void;
}

function exitableLevelOrderTraversal<T>(
  tree: BinaryTree<T>,
  fn: ExitableTraversalFn<T>
) {
  let signaledExit = false;
  function exit() {
    signaledExit = true;
  }
  try {
    levelorderTraversal(tree, (unwrappedValue, wrappedNode) => {
      fn(unwrappedValue, wrappedNode, { exit });
      if (signaledExit) {
        throw 0;
      }
    });
  } catch (e) {
    if (e !== 0) throw e;
  }
}

export { exitableLevelOrderTraversal };
export default levelorderTraversal;
