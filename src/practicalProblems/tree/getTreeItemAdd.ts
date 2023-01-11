import type { BinaryTree } from '../../data_structure/tree/shared.types';
import { useLevelOrderTraversal } from '../../data_structure/tree/traversal';
import { iterWithRecurApproach } from '../../util';

const getTreeAddRecur = (
  tree: BinaryTree<number> | null | undefined
): number => {
  if (!tree) return 0;
  return tree.value + getTreeAddRecur(tree.left) + getTreeAddRecur(tree.right);
};

const getTreeAddIter = (tree: BinaryTree<number>) => {
  let sum = 0;
  useLevelOrderTraversal(tree, (value) => (sum += value));
  return sum;
};

const getTreeAdd = iterWithRecurApproach({
  recur: getTreeAddRecur,
  iter: getTreeAddIter,
});

export { getTreeAdd };
