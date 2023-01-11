import { BinaryTree } from '../../data_structure/tree/shared.types';

function makeTreeInMirrorForm<T>(tree: BinaryTree<T>) {
  if (!(tree.left || tree.right)) return tree;

  const leftTree = tree.left;
  const rightTree = tree.right;
  tree.right = leftTree ? makeTreeInMirrorForm(leftTree) : null;
  tree.left = rightTree ? makeTreeInMirrorForm(rightTree) : null;

  return tree;
}

export { makeTreeInMirrorForm };
