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

  const shiftToLeftTree = (current: BinaryTree<T>) => current.left ?? null;

  const shiftToRightTree = (current: BinaryTree<T>) => current.right ?? null;

  function checkRootIsDueProcess(
    current: BinaryTree<T>,
    lastProcessNode: BinaryTree<T> | null
  ) {
    return current.right === null || current.right === lastProcessNode;
  }

  do {
    while (currentRoot) {
      rootMantainedStack.push(currentRoot);
      currentRoot = shiftToLeftTree(currentRoot);
    }

    while (currentRoot === null || !rootMantainedStack.isEmpty()) {
      currentRoot = rootMantainedStack.peek()!;

      if (checkRootIsDueProcess(currentRoot, previousProcessedNode)) {
        cb(unwrapTreeValue(currentRoot));
        rootMantainedStack.pop();
        previousProcessedNode = currentRoot;
        currentRoot = null;
      } else currentRoot = shiftToRightTree(currentRoot);
    }
  } while (!rootMantainedStack.isEmpty());
};

export default postOrderTraversal;
