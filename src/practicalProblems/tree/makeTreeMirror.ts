import { BinaryTree } from '../../data_structure/tree/shared.types';

function makeTreeInMirrorForm<T>(tree: BinaryTree<T>) {
  if (!(tree.left || tree.right)) return tree;

  tree.right = tree.left ? makeTreeInMirrorForm(tree.left) : null;
  tree.left = tree.right ? makeTreeInMirrorForm(tree.right) : null;

  return tree;
}

export { makeTreeInMirrorForm };
