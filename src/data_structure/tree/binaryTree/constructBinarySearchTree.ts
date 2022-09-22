import { not } from '../../../util/index';
import levelorderTraversal from '../traversal/levelorder';
import {
  createBinaryTree,
<<<<<<< HEAD
=======
  isNodeLeaf,
>>>>>>> 67b0486 (safe changes)
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

interface TreeNodeInfoOption<T> {
  value: T;
  checker: (side: 'left' | 'right', current: T) => boolean;
}

function getBinarySearchPredicate<T>(value: T): Readonly<{
  value: T;
  checker: (side: 'left' | 'right', current: T) => boolean;
}> {
  return Object.freeze({
    value,
    checker: (side, currentValue) => {
      switch (side) {
        case 'left':
          return currentValue <= value;
        case 'right':
        default:
          currentValue >= value;
          return false;
      }
    },
  });
}
// function getBinarySearchPredicate<T>(value: T) : TreeNodeInfoOption<T>{
//   const checker: TreeNodeInfoOption<T>['checker'] = (
//     side: 'left' | 'right',
//     { current, search }
//   ) => {
//     switch (side) {
//       case 'left':
//         return current <= search;
//       case 'right':
//       default:
//         current >= search;
//         return false;
//     }
//   };
//   return {value};
// }

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
      if (currentRootCanLeftBranch(currentPossibleRoot) && moveLeft) {
        currentPossibleRoot = currentPossibleRoot.left;
      } else if (moveLeft) {
        return (currentPossibleRoot.left = createBinaryTree(value));
      } else if (currentRootCanRightBranch(currentPossibleRoot)) {
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

<<<<<<< HEAD
  function provideTreeNodeWithItInfo(value: T): TreeNodeWithInfo<T> | null {
    let ancestorTreeList = Array<BinaryTree<T>>();
    let currentTreeRoot = null;
    let currentTree = currentTreeRoot as BinaryTree<T> | null;
    if (!currentTree) return null;
    let foundTreeWithSearchedValue = false;
=======
  function provideTreeNodeWithItInfo(
    rootTree: BinaryTree<T> | null,
    option: TreeNodeInfoOption<T>
  ): TreeNodeWithInfo<T> | null {
    let ancestorsTree = Array<BinaryTree<T>>();
    let parentNode = null;
    let currentTree = rootTree;
    if (!currentTree) return null;
    let hasFoundTree = false;
    const { checker, value } = option;
>>>>>>> 67b0486 (safe changes)

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
<<<<<<< HEAD
          (satistiedBranchRule =
            currentRootCanLeftBranch(currentTree) &&
            canMoveLeft(currentTree, value))
=======
          (hasMatch =
            currentRootHasLeftChild(currentTree) &&
            checker('left', unwrapNodeTreeValue(currentTree)))
>>>>>>> 67b0486 (safe changes)
        ) {
          currentTree = currentTree.left;
        } else if (
<<<<<<< HEAD
          (satistiedBranchRule =
            currentRootCanRightBranch(currentTree) &&
            canMoveRight(currentTree, value))
=======
          (hasMatch =
            currentRootHasRightChild(currentTree) &&
            checker('right', unwrapNodeTreeValue(currentTree)))
>>>>>>> 67b0486 (safe changes)
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

<<<<<<< HEAD
  function getNodeInorderPredecessor(successorNode: BinaryTree<T>) {
    let predeccessorRoot = null as BinaryTree<T> | null;
    let predeccessorNode!: BinaryTree<T> | null;
    try {
      inorderTraversal(successorNode, (value, currentNode) => {
        if (value === successorNode.value) throw true;
        predeccessorRoot = predeccessorNode;
        predeccessorNode = currentNode;
      });
    } catch {}
    return { predeccessor: predeccessorNode, predeccessorRoot };
  }

  function deleteItem(value: T) {
    const toBeDisposedTreeInfo = provideTreeNodeWithItInfo(value);
    if (!toBeDisposedTreeInfo) return toBeDisposedTreeInfo;

    const { immediateParent, node } = toBeDisposedTreeInfo;
    if (!immediateParent && isTreeLeftSkew(node)) {
      rootTree = null;
      return node;
    }

    const { predeccessor, predeccessorRoot } = getNodeInorderPredecessor(node);
    predeccessorRoot!.left = node.left;
    predeccessorRoot!.right = node.right;

    if (predeccessor) {
      if (predeccessor.left === predeccessorRoot) predeccessor.left = null;
      else predeccessor.right = null;
    }

    if (immediateParent) {
      if (immediateParent.left === node) immediateParent.left = node;
      else immediateParent.right = node;
    }

    return node;
=======
  function deleteItem(value: T) {
    const toBeDisposedTreeInfo = provideTreeNodeWithItInfo(
      rootTree,
      getBinarySearchPredicate(value)
    );

    if (!toBeDisposedTreeInfo) return toBeDisposedTreeInfo;
    if (isNodeLeaf(toBeDisposedTreeInfo.node))
      return toBeDisposedTreeInfo.node ?? null;

    const { node, immediateParent } = toBeDisposedTreeInfo;
    if (!immediateParent) {
      let n = node.left ?? node.right;
      if (n) {
        let currentNode = unwrapNodeTreeValue(n);
      }
      return node;
    }
>>>>>>> 67b0486 (safe changes)
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
