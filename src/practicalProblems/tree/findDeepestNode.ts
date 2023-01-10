import type { BinaryTree } from '../../data_structure/tree/shared.types';
import { useLevelOrderTraversal } from '../../data_structure/tree/traversal';

function findDeepestNode<T>(tree: BinaryTree<T>) {
  let temp: typeof tree | null = null;
  useLevelOrderTraversal(tree, (_, node) => (temp = node));
  return temp!;
}

export { findDeepestNode };
