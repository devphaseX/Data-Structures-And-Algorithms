import { not } from '../../../util/index';
import levelorderTraversal from '../traversal/levelorder';
import {
  createBinaryTree,
  isTreeLeftSkew,
  unwrapNodeTreeValue,
} from '../shared';
import type {
  BinarySearchTree,
  BinaryTree,
  LeftSkewTree,
  RightSkewTree,
} from '../shared.types';
import inorderTraversal from '../traversal/inorder';

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

  interface TreeNodeWithInfo<T> {
    ancestors: Array<BinaryTree<T>>;
    immediateParent: null | BinaryTree<T>;
    node: BinaryTree<T>;
  }

  function provideTreeNodeWithItInfo(value: T): TreeNodeWithInfo<T> | null {
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

        if (hasMatch && disposedParentNode)
          ancestorsTree.push(disposedParentNode);
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

  function getNodeInorderPredecessor(node: BinaryTree<T>) {
    let parent = null as BinaryTree<T> | null;
    let previousNode!: BinaryTree<T> | null;
    try {
      inorderTraversal(node, (value, currentNode) => {
        if (value === node.value) throw true;
        parent = previousNode;
        previousNode = currentNode;
      });
    } catch {}
    return { previousNode, parent };
  }

  function deleteItem(value: T) {
    const toBeDisposedTreeInfo = provideTreeNodeWithItInfo(value);
    if (!toBeDisposedTreeInfo) return toBeDisposedTreeInfo;

    const { immediateParent, node } = toBeDisposedTreeInfo;
    if (!immediateParent && isTreeLeftSkew(node)) {
      rootTree = null;
      return node;
    }

    const { parent, previousNode } = getNodeInorderPredecessor(node);
    previousNode!.left = node.left;
    previousNode!.right = node.right;

    if (parent) {
      if (parent.left === previousNode) parent.left = null;
      else parent.right = null;
    }

    if (immediateParent) {
      if (immediateParent.left === node) immediateParent.left = node;
      else immediateParent.right = node;
    }

    return node;
  }

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
