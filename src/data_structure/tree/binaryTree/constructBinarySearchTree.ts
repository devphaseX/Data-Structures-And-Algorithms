import { not } from '../../../util/index';
import levelorderTraversal from '../traversal/levelorder';
import { createBinaryTree } from '../shared';
import type {
  BinarySearchTree,
  BinaryTree,
  LeftSkewTree,
  RightSkewTree,
} from '../shared.types';

function createBinarySearchTree<T>(
  treeItems?: Array<T> | T
): BinarySearchTree<T> {
  let rootTree: BinaryTree<T> | null = null;

  if (treeItems) ([treeItems].flat() as Array<T>).forEach(insert);

  const currentRootHasLeftChild = (
    node: BinaryTree<T>
  ): node is LeftSkewTree<T> => !!node.left;
  const currentRootHasRightChild = not(currentRootHasLeftChild) as (
    node: BinaryTree<T>
  ) => node is RightSkewTree<T>;

  function insert(value: T) {
    if (!rootTree) rootTree = createBinaryTree(value);
    let currentPossibleRoot = rootTree;
    while (true) {
      const valueShouldGoLeft = currentPossibleRoot.value < value;
      if (valueShouldGoLeft && currentRootHasLeftChild(currentPossibleRoot)) {
        currentPossibleRoot = currentPossibleRoot.left;
      } else if (valueShouldGoLeft) {
        return (currentPossibleRoot.left = createBinaryTree(value));
      } else if (
        currentPossibleRoot.value > value &&
        currentRootHasRightChild(currentPossibleRoot)
      ) {
        currentPossibleRoot = currentPossibleRoot.right;
      } else {
        return (currentPossibleRoot.right = createBinaryTree(value));
      }
    }
  }

  function addChangeImmutable(
    immutableContext: (tree: BinarySearchTree<T>) => void
  ): BinarySearchTree<T> {
    let treeClone = createBinarySearchTree<T>();
    if (rootTree) {
      levelorderTraversal(rootTree, treeClone.insert);
      immutableContext(treeClone);
      return treeClone;
    }
    return treeClone;
  }

  return { insert, addChangeImmutable };
}

export { createBinarySearchTree };
