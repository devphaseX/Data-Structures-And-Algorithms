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

function findMax(rootTree: BinaryTree<number>): number {
  if (isNodeLeaf(rootTree)) return unwrapNodeTreeValue(rootTree);

  let tree = rootTree as SkewTree<number>;
  if (isFullNode(tree)) {
    return Math.max(findMax(tree.left), findMax(tree.right));
  }

  return isTreeLeftSkew(tree) ? findMax(tree.left) : findMax(tree.right);
}

export default findMax;
