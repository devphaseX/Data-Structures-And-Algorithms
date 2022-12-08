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

type ExitableTraversalFn<T> = (
  value: T,
  raw: BinaryTree<T>,
  options: ExitableTraversalOption
) => void;

function exitableLevelOrderTraversal<T>(
  tree: BinaryTree<T>,
  fn: ExitableTraversalFn<T>
) {
  let signaledExit = false;
  function exit() {
    signaledExit = true;
  }
  const _errorFlag = Symbol();
  try {
    levelorderTraversal(tree, (unwrappedValue, wrappedNode) => {
      fn(unwrappedValue, wrappedNode, { exit });
      if (signaledExit) {
        throw _errorFlag;
      }
    });
  } catch (e) {
    if (e !== _errorFlag) throw e;
  }
}

export { exitableLevelOrderTraversal };
export default levelorderTraversal;
