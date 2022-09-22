import createStack from '../../stack/index';
import { unwrapNodeTreeValue } from '../shared';
import type { BinaryTree, TreeTraversalFn } from '../shared.types';

const inorderTraversal = <T>(
  rootTree: BinaryTree<T>,
  cb: TreeTraversalFn<T>
) => {
  const rootMantainedStack = createStack<BinaryTree<T>>(null);
  let currentRoot = rootTree as BinaryTree<T> | null;

  const shiftToLeftTree = (current: BinaryTree<T>) => current.left ?? null;

  const shiftToRightTree = (current: BinaryTree<T>) => current.right ?? null;

  while (true) {
    while (currentRoot) {
      currentRoot = shiftToLeftTree(currentRoot);
    }

    if (rootMantainedStack.isEmpty()) break;
    currentRoot = rootMantainedStack.pop();
    cb(unwrapNodeTreeValue(currentRoot), currentRoot);
    currentRoot = shiftToRightTree(currentRoot);
  }
};

export default inorderTraversal;
