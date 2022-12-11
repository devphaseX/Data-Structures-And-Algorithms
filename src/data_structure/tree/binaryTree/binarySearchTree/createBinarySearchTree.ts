import { preventImmutability } from '../../../../util/index';
import levelorderTraversal from '../../traversal/levelorder';
import {
  createBinaryTree,
  isSkewTree,
  isTreeLeftSkew,
  isTreeRightSkew,
  unwrapNodeTreeValue,
} from '../../shared';
import type {
  BinarySearchTree,
  BinaryTree,
  LeftSkewTree,
  RightSkewTree,
} from '../../shared.types';
import inorderTraversal from '../../traversal/inorder';

type OrderIndex = -1 | 0 | 1;
function createBinarySearchTree<T>(
  nodeComparatorFn: (
    current: T,
    another: T,
    direction: 'left' | 'right'
  ) => OrderIndex,
  treeItems?: Array<T> | T
): BinarySearchTree<T> {
  let rootTree: BinaryTree<T> | null = null;

  if (treeItems) ([treeItems].flat() as Array<T>).forEach(insert);

  function nodeOrderResolver(
    node: BinaryTree<T>,
    value: T,
    direction: 'left' | 'right'
  ) {
    let orderResult = nodeComparatorFn(
      unwrapNodeTreeValue(node),
      value!,
      direction
    );
    switch (orderResult) {
      case 0:
        return false;

      case 1:
        return !!orderResult;

      case -1:
        return false;

      default: {
        throw new TypeError(
          'Invalid comparison order expected [-1, 0, 1] but got ' + orderResult
        );
      }
    }
  }

  const currentRootCanLeftBranch = (
    node: BinaryTree<T>,
    value?: T
  ): node is LeftSkewTree<T> => {
    return (
      !!node.left &&
      ((typeof value !== 'undefined' &&
        nodeOrderResolver(node, value, 'left')) ||
        true)
    );
  };

  const currentRootCanRightBranch = (
    node: BinaryTree<T>,
    value?: T
  ): node is RightSkewTree<T> => {
    return (
      (!!node.right &&
        typeof value !== 'undefined' &&
        nodeOrderResolver(node, value, 'right')) ||
      true
    );
  };

  function _insert(
    value: T,
    observe?: (value: { node: BinaryTree<T>; value: T }) => void
  ) {
    if (!rootTree) rootTree = createBinaryTree(value);
    let currentPossibleRoot = rootTree;
    while (true) {
      if (currentPossibleRoot.value === value) return currentPossibleRoot;
      observe?.({
        node: preventImmutability(currentPossibleRoot),
        value: currentPossibleRoot.value,
      });

      if (currentRootCanLeftBranch(currentPossibleRoot, value)) {
        currentPossibleRoot = currentPossibleRoot.left;
      } else if (!currentPossibleRoot.left) {
        currentPossibleRoot.left = createBinaryTree(value);
        return preventImmutability(currentPossibleRoot.left);
      }

      if (currentRootCanRightBranch(currentPossibleRoot, value)) {
        currentPossibleRoot = currentPossibleRoot.right;
      } else {
        currentPossibleRoot.right = createBinaryTree(value);
        return preventImmutability(currentPossibleRoot.right);
      }
    }
  }

  function insert(value: T) {
    return _insert(value);
  }

  interface NodePath<T> {
    ancestors: Array<BinaryTree<T>>;
    immediateParent: null | BinaryTree<T>;
    node: BinaryTree<T>;
  }

  function getNodeTreeOrderPathInfo(value: T): NodePath<T> | null {
    let ancestorTreeList = Array<BinaryTree<T>>();
    let currentTreeParent = null;
    let tree = rootTree as BinaryTree<T> | null;
    if (!tree) return null;
    let foundTreeWithSearchedValue = false;

    while (true) {
      if ((foundTreeWithSearchedValue = unwrapNodeTreeValue(tree) === value))
        break;
      else {
        let satistiedBranchRule = false;
        let disposedParentNode = currentTreeParent;
        if ((satistiedBranchRule = currentRootCanLeftBranch(tree, value))) {
          tree = tree.left;
        } else if (
          (satistiedBranchRule = currentRootCanRightBranch(tree, value))
        ) {
          currentTreeParent = tree;
          tree = tree.right;
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
      immediateParent: currentTreeParent,
      node: tree,
    };
  }

  function getInorderNodePredecessor(currentNode: BinaryTree<T>) {
    let predecessorNode!: BinaryTree<T> | null;
    const _internalResultInterrupFlag = Symbol();

    try {
      inorderTraversal(currentNode, (_, currentTraverseNode) => {
        if (currentTraverseNode === currentNode) {
          throw _internalResultInterrupFlag;
        }
        predecessorNode = currentTraverseNode;
      });
    } catch (e) {
      if (e !== _internalResultInterrupFlag) throw e;
    }
    return predecessorNode;
  }

  function deleteItem(value: T) {
    const searchedNodePath = getNodeTreeOrderPathInfo(value);
    if (!searchedNodePath) return searchedNodePath;

    const { immediateParent, node: currentRootNode } = searchedNodePath;
    if (!immediateParent) {
      rootTree = null;
      return currentRootNode;
    }

    const inorderPredecessorNode = getInorderNodePredecessor(currentRootNode);

    let isSkew = false;
    if (!inorderPredecessorNode || (isSkew = isSkewTree(currentRootNode))) {
      const replacementNode = isSkew
        ? currentRootNode.left ?? currentRootNode.right
        : null;

      if (immediateParent.left === currentRootNode) {
        immediateParent.left = replacementNode;
      } else {
        immediateParent.right = replacementNode;
      }
      return currentRootNode;
    }

    ({
      left: inorderPredecessorNode.left,
      right: inorderPredecessorNode.right,
    } = currentRootNode);

    currentRootNode.left = currentRootNode.right = null;
    return currentRootNode;
  }

  function addChangeImmutable(
    immutableContext: (tree: BinarySearchTree<T>) => void
  ): BinarySearchTree<T> {
    let treeClone = clone(rootTree);
    immutableContext(treeClone);
    return treeClone;
  }

  function clone(rootTree: BinaryTree<T> | null) {
    let structureSharedTree = createBinarySearchTree<T>(nodeComparatorFn);
    if (rootTree) levelorderTraversal(rootTree, structureSharedTree.insert);
    return structureSharedTree;
  }

  return { insert, addChangeImmutable, deleteItem, __: { insert: _insert } };
}

export { createBinarySearchTree };
