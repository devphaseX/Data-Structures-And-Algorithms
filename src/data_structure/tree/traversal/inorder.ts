import createStack from '../../stack/index';
import { unwrapTreeValue } from '../shared';
import type { BinaryTree, TreeTraversalFn } from '../shared.types';

const inorderTraversal = <T>(
  rootTree: BinaryTree<T>,
  cb: TreeTraversalFn<T>
) => {
  const rootMantainedStack = createStack<BinaryTree<T>>(null);
  let currentRoot = rootTree as BinaryTree<T> | null;

  const shiftCurrentToLeftTree = () => {
    if (currentRoot) currentRoot = currentRoot.left ?? null;
  };

  const shiftCurrentToRightTree = () => {
    if (currentRoot) currentRoot = currentRoot.right ?? null;
  };

  while (true) {
    while (currentRoot) {
      shiftCurrentToLeftTree();
    }

    if (rootMantainedStack.isEmpty()) break;
    currentRoot = rootMantainedStack.pop();
    cb(unwrapTreeValue(currentRoot));
    shiftCurrentToRightTree();
  }
};

export default inorderTraversal;
