import {
  isNodeLeaf,
  unwrapNodeTreeValue,
} from '../../data_structure/tree/shared';
import { BinaryTree } from '../../data_structure/tree/shared.types';
import { exitableLevelOrderTraversal } from '../../data_structure/tree/traversal/levelorder';
import { equal, iterWithRecurApproach } from '../../util/index';

function findItemUsingRecur<T>(tree: BinaryTree<T>, item: T): boolean {
  if (equal.check(unwrapNodeTreeValue(tree), item)) return true;

  return isNodeLeaf(tree)
    ? false
    : findItemUsingRecur(tree.left!, item) ||
        findItemUsingRecur(tree.right!, item);
}

function findItemUsingIter<T>(tree: BinaryTree<T>, item: T) {
  let hasFoundItem = false;

  exitableLevelOrderTraversal(tree, (curNodeValue, _, option) => {
    if (curNodeValue !== item) return;
    hasFoundItem = true;
    return option.exit();
  });
  return hasFoundItem;
}

export default iterWithRecurApproach({
  iter: findItemUsingIter,
  recur: findItemUsingRecur,
});
