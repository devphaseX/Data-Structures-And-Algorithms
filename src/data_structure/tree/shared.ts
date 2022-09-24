import {
  getListFirstItem,
  getListSize,
  not,
  OUT_OF_RANGE,
  takeAfter,
  takeUntil,
} from '../../util/index.js';
import {
  BinaryTree,
  InPreOrderOption,
  InternalBinaryNode,
  LeftSkewTree,
  ListBinaryFrom,
  PreInTreeMember,
  RightSkewTree,
} from './shared.types';

function unwrapNodeTreeValue<T>(value: BinaryTree<T>) {
  return value.value;
}

function isNodeLeaf(node: BinaryTree<any>) {
  return !node.left && !node.right;
}

type InternalBinaryNodePredicateFn<T> = (
  node: BinaryTree<T>
) => node is InternalBinaryNode<T>;

const isNodeInternal = not(isNodeLeaf) as InternalBinaryNodePredicateFn<any>;

const isTreeLeftSkew = <T>(node: BinaryTree<T>): node is LeftSkewTree<T> =>
  !!node.left && !node.right;

const isTreeRightSkew = <T>(node: BinaryTree<T>): node is RightSkewTree<T> =>
  !node.left && !!node.right;

function createBinaryTree<T>(value: T): BinaryTree<T> {
  return { value };
}

const getTreeMembers = <T>(
  leftMember: T,
  option: InPreOrderOption<T>
): PreInTreeMember<T> | null => {
  const { preorder, inorder } = option;
  const rootPosition = inorder.indexOf(leftMember);
  if (rootPosition === OUT_OF_RANGE) return null;

  const leftPostorderMembers = takeUntil(inorder, rootPosition);
  const rightPostorderMembers = takeAfter(inorder, rootPosition, -1);

  function getLastPreorderFoundMember(inorder: ListBinaryFrom<any>) {
    const uniqueMembers = new Set(inorder);
    let lastFoundOrderIndex = OUT_OF_RANGE;

    inorder.some((item, index) => {
      if (uniqueMembers.has(item)) {
        lastFoundOrderIndex = index;
        return true;
      }
      return false;
    });

    return lastFoundOrderIndex;
  }

  const lastPreorderFoundMemberIndex = getLastPreorderFoundMember(inorder);
  return {
    leftMembers: {
      inorder: leftPostorderMembers,
      preorder: takeAfter(preorder, 1, lastPreorderFoundMemberIndex),
    },
    rightMembers: {
      inorder: rightPostorderMembers,
      preorder: takeUntil(preorder, lastPreorderFoundMemberIndex + 1),
    },
  };
};

export {
  getTreeMembers,
  createBinaryTree,
  unwrapNodeTreeValue,
  isNodeLeaf,
  isNodeInternal,
  isTreeLeftSkew,
  isTreeRightSkew,
};
