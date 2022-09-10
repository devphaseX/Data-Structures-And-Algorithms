import createStack from '../../stack/index.js';
import { unwrapTreeValue } from '../shared';
import type { BinaryTree, TreeTraversalFn } from '../shared.types';

const preOrderTreeTraversal = <T>(
  treeRoot: BinaryTree<T>,
  cb: TreeTraversalFn<T>
) => {
  const rootMantainedStack = createStack<BinaryTree<T>>(null);
  let currentRoot = treeRoot as BinaryTree<T> | null;

  const shiftCurrentToLeftTree = () => {
    if (currentRoot) currentRoot = currentRoot.left ?? null;
  };

  const shiftCurrentToRightTree = () => {
    if (currentRoot) currentRoot = currentRoot.right ?? null;
  };

  while (true) {
    while (currentRoot) {
      cb(unwrapTreeValue(currentRoot));
      shiftCurrentToLeftTree();
    }

    if (rootMantainedStack.isEmpty()) break;
    currentRoot = rootMantainedStack.pop();
    shiftCurrentToRightTree();
  }
};

export default preOrderTreeTraversal;
