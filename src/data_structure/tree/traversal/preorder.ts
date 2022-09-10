import createStack from '../../stack/index.js';
import { unwrapTreeValue } from '../shared';
import { BinaryTree, TreeTraversalFn } from '../shared.types';

const preOrderTreeTraversal = <T>(
  treeRoot: BinaryTree<T>,
  cb: TreeTraversalFn<T>
) => {
  const rootMantainedStack = createStack<BinaryTree<T>>(null);
  let currentRoot: BinaryTree<T> | null = treeRoot;

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
