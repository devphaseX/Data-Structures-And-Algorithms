import createStack from '../../stack/index';
import { unwrapTreeValue } from '../shared';
import type { BinaryTree, TreeTraversalFn } from '../shared.types';

const postOrderTraversal = <T>(
  rootTree: BinaryTree<T>,
  cb: TreeTraversalFn<T>
) => {
  const rootMantainedStack = createStack<BinaryTree<T>>(null);
  let currentRoot = rootTree as BinaryTree<T> | null;
  let previousProcessedNode = null as BinaryTree<T> | null;

  const shiftCurrentToLeftTree = () => {
    if (currentRoot) currentRoot = currentRoot.left ?? null;
  };

  const shiftCurrentToRightTree = () => {
    if (currentRoot) currentRoot = currentRoot.right ?? null;
  };

  function isCurrentDueForProcess(
    current: BinaryTree<T>,
    lastProcessNode: BinaryTree<T> | null
  ) {
    return current.right === null || current.right === lastProcessNode;
  }

  do {
    while (currentRoot) {
      rootMantainedStack.push(currentRoot);
      shiftCurrentToLeftTree();
    }

    while (currentRoot === null || !rootMantainedStack.isEmpty()) {
      currentRoot = rootMantainedStack.peek()!;

      if (isCurrentDueForProcess(currentRoot, previousProcessedNode)) {
        cb(unwrapTreeValue(currentRoot));
        rootMantainedStack.pop();
        previousProcessedNode = currentRoot;
        currentRoot = null;
      } else shiftCurrentToRightTree();
    }
  } while (!rootMantainedStack.isEmpty());
};

export default postOrderTraversal;
