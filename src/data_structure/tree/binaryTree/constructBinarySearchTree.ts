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

  const currentRootCanLeftBranch = (
    node: BinaryTree<T>
  ): node is LeftSkewTree<T> => !!node.left;
  const currentRootCanRightBranch = not(currentRootCanLeftBranch) as (
    node: BinaryTree<T>
  ) => node is RightSkewTree<T>;

  const canMoveLeft = (tree: BinaryTree<T>, value: T) =>
    unwrapNodeTreeValue(tree) <= value;

  const canMoveRight = not(canMoveLeft);

  function insert(value: T) {
    if (!rootTree) rootTree = createBinaryTree(value);
    let currentPossibleRoot = rootTree;
    while (true) {
      const moveLeft = canMoveLeft(currentPossibleRoot, value);
      if (moveLeft && currentRootCanLeftBranch(currentPossibleRoot)) {
        currentPossibleRoot = currentPossibleRoot.left;
      } else if (moveLeft) {
        return (currentPossibleRoot.left = createBinaryTree(value));
      } else if (!moveLeft && currentRootCanRightBranch(currentPossibleRoot)) {
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
    let ancestorTreeList = Array<BinaryTree<T>>();
    let currentTreeRoot = null;
    let currentTree = currentTreeRoot as BinaryTree<T> | null;
    if (!currentTree) return null;
    let foundTreeWithSearchedValue = false;

    while (true) {
      if (
        (foundTreeWithSearchedValue =
          unwrapNodeTreeValue(currentTree) === value)
      )
        break;
      else {
        let satistiedBranchRule = false;
        let disposedParentNode = currentTreeRoot;
        if (
          (satistiedBranchRule =
            currentRootCanLeftBranch(currentTree) &&
            canMoveLeft(currentTree, value))
        ) {
          currentTree = currentTree.left;
        } else if (
          (satistiedBranchRule =
            currentRootCanRightBranch(currentTree) &&
            canMoveRight(currentTree, value))
        ) {
          currentTreeRoot = currentTree;
          currentTree = currentTree.right;
        }

        if (satistiedBranchRule && disposedParentNode) {
          ancestorTreeList.push(disposedParentNode);
          continue;
        }
      }
      break;
    }

    if (!foundTreeWithSearchedValue) return null;

    return {
      ancestors: ancestorTreeList,
      immediateParent: currentTreeRoot,
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

  return { insert, addChangeImmutable, deleteItem };
}

export { createBinarySearchTree };
