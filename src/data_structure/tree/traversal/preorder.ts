import createStack from '../../stack/index.js';
import { unwrapNodeTreeValue } from '../shared';
import type { BinaryTree, TreeTraversalFn } from '../shared.types';

const preOrderTreeTraversal = <T>(
  treeRoot: BinaryTree<T>,
  cb: TreeTraversalFn<T>
) => {
  const rootMantainedStack = createStack<BinaryTree<T>>(null);
  let currentRoot = treeRoot as BinaryTree<T> | null;

  const shiftToLeftTree = (current: BinaryTree<T>) => current.left ?? null;
  const shiftToRightTree = (current: BinaryTree<T>) => current.right ?? null;

  while (true) {
    while (currentRoot) {
      cb(unwrapNodeTreeValue(currentRoot), currentRoot);
      currentRoot = shiftToLeftTree(currentRoot);
    }

    if (rootMantainedStack.isEmpty()) break;
    currentRoot = rootMantainedStack.pop();
    currentRoot = shiftToRightTree(currentRoot);
  }
};

export default preOrderTreeTraversal;
