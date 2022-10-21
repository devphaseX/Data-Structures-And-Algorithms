import {
  isFullNode,
  isNodeLeaf,
  isTreeLeftSkew,
  unwrapNodeTreeValue,
} from '../../data_structure/tree/shared.js';
import type {
  BinaryTree,
  SkewTree,
} from '../../data_structure/tree/shared.types';
import levelorderTraversal from '../../data_structure/tree/traversal/levelorder';

function findMaxRecur(rootTree: BinaryTree<number>): number {
  if (isNodeLeaf(rootTree)) return unwrapNodeTreeValue(rootTree);

  let tree = rootTree as SkewTree<number>;
  if (isFullNode(tree)) {
    return Math.max(findMaxRecur(tree.left), findMaxRecur(tree.right));
  }

  return isTreeLeftSkew(tree)
    ? findMaxRecur(tree.left)
    : findMaxRecur(tree.right);
}

function findMaxIter(rootTree: BinaryTree<number>) {
  let max: number;
  levelorderTraversal(rootTree, (curNodeValue) => {
    if (typeof max === 'undefined') return (max = curNodeValue);
    max = Math.max(max, curNodeValue);
  });
  return max!;
}

const algApproach = { recur: findMaxRecur, iter: findMaxIter };

export default algApproach;
