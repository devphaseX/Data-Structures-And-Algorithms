import {
  isNodeInternal,
  isNodeLeaf,
  isTreeLeftSkew,
  unwrapTreeValue,
} from '../../data_structure/tree/shared';
import {
  BinaryTree,
  RightSkewTree,
} from '../../data_structure/tree/shared.types';

function findMax(rootTree: BinaryTree<number>): number {
  if (isNodeLeaf(rootTree)) return unwrapTreeValue(rootTree);

  if (isNodeInternal(rootTree)) {
    let left = findMax(rootTree.left);
    let right = findMax(rootTree.right);
    return Math.max(left, right);
  }

  return isTreeLeftSkew(rootTree)
    ? findMax(rootTree.left)
    : findMax((rootTree as RightSkewTree<number>).right);
}

export default findMax;
