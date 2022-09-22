import { not } from '../../../util/index';
import levelorderTraversal from '../traversal/levelorder';
import { createBinaryTree, unwrapNodeTreeValue } from '../shared';
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

  function provideTreeNodeWithItInfo(value: T) {
    let ancestorsTree = Array<BinaryTree<T>>();
    let parentNode = null;
    let currentTree = parentNode as BinaryTree<T> | null;
    if (!currentTree) return null;
    let hasFoundTree = false;

    while (true) {
      if ((hasFoundTree = unwrapNodeTreeValue(currentTree) === value)) break;
      else {
        let hasMatch = false;
        let disposedParentNode = parentNode;
        if (
          (hasMatch =
            currentRootHasLeftChild(currentTree) &&
            unwrapNodeTreeValue(currentTree.left) <= value)
        ) {
          currentTree = currentTree.left;
          continue;
        } else if (
          (hasMatch =
            currentRootHasRightChild(currentTree) &&
            unwrapNodeTreeValue(currentTree.right) >= value)
        ) {
          parentNode = currentTree;
          currentTree = currentTree.right;
          continue;
        }

        if (hasMatch && dispoosedParentNode)
          ancestorsTree.push(dispoosedParentNode);
      }
      break;
    }

    if (!hasFoundTree) return null;

    return {
      ancestors: ancestorsTree,
      immediateParent: parentNode,
      node: currentTree,
    };
  }

  function deleteItem(value: T) {}

  function addChangeImmutable(
    immutableContext: (tree: BinarySearchTree<T>) => void
  ): BinarySearchTree<T> {
    let treeClone = clone(rootTree);
    immutableContext(treeClone);
    return treeClone;
  }

  function clone(rootTree: BinaryTree<T> | null) {
    let structureSharedTree = createBinarySearchTree<T>();
    if (rootTree) levelorderTraversal(rootTree, structureSharedTree.insert);
    return structureSharedTree;
  }

  return { insert, addChangeImmutable };
}

export { createBinarySearchTree };
