import createStack from '../../data_structure/stack/index.js';
import {
  createBinaryTree,
  getTreeMembers,
  isEmptyTreeOrder,
  isLeftSkewTreeItemsForm,
  isRightSkewTreeItemsForm,
  orderItemsorderSame,
} from '../../data_structure/tree/shared.js';
import type {
  BinaryTree,
  InPreOrderOption,
  ListBinaryFrom,
  TraverseTreeCheck,
} from '../../data_structure/tree/shared.types.js';
import {
  getListFirstItem,
  getListLastItem,
  getListSize,
  iterableLoop,
  outOfRange,
} from '../../util/index.js';

interface ConstructBinaryTreeInfo<T> {
  info: TreeMemberInfo<T>;
  continueProcess: ContinueTreeTraversalProcessType;
}

type ContinueTreeTraversalProcessType =
  | 'left'
  | 'right'
  | 'root'
  | 'leftSkew'
  | 'rightSkew';

type BackTrackTraversalProcessType = Exclude<
  ContinueTreeTraversalProcessType,
  'left' | 'right'
>;

interface TreeMemberInfo<T> {
  subTree: {
    leftMembers: ListBinaryFrom<T>;
    rightMembers: ListBinaryFrom<T>;
  };
  root: { node: BinaryTree<T>; position: number };
}

function createTreeMemberInfo<T>(
  value: T,
  position: number,
  inoder: ListBinaryFrom<T>
): TreeMemberInfo<T> {
  return {
    subTree: {
      leftMembers: inoder.slice(0, position),
      rightMembers: inoder.slice(position + 1),
    },
    root: { node: createBinaryTree(value), position },
  };
}

function getTreeContinueStatus(
  treeInfo: TreeMemberInfo<any>
): ContinueTreeTraversalProcessType {
  return isLeftSkewTreeItemsForm(treeInfo.subTree)
    ? 'leftSkew'
    : isRightSkewTreeItemsForm(treeInfo.subTree)
    ? 'rightSkew'
    : 'right';
}

const createBinaryTreeInfo = <T>(
  info: TreeMemberInfo<T>
): ConstructBinaryTreeInfo<T> => ({
  info,
  continueProcess: getTreeContinueStatus(info),
});

const getTreeInfo = <T>(
  value: T,
  inorder: ListBinaryFrom<T>,
  check: TraverseTreeCheck<T>
): TreeMemberInfo<T> | null => {
  const rootPosition = inorder.findIndex((current) => check(value, current));
  return outOfRange(rootPosition, { start: 0, end: inorder.length })
    ? null
    : createTreeMemberInfo(value, rootPosition, inorder);
};

const backTrackTraversalTypes: ReadonlyArray<BackTrackTraversalProcessType> = [
  'root',
  'leftSkew',
  'rightSkew',
];

const detectLeaf = (tree: TreeMemberInfo<any>) =>
  isEmptyTreeOrder(tree.subTree.leftMembers) &&
  isEmptyTreeOrder(tree.subTree.rightMembers);

const allowBackTrack = (processType: string | undefined | null) =>
  !processType || backTrackTraversalTypes.includes(processType as any);

const startBackTrackFromLeft = (
  tree: ConstructBinaryTreeInfo<any>,
  hasReachLeaf: boolean
) =>
  (hasReachLeaf && tree.continueProcess === 'right') ||
  tree.continueProcess === 'leftSkew';

const startBackTrackFromRight = (
  tree: ConstructBinaryTreeInfo<any>,
  hasReachLeaf: boolean
) =>
  (hasReachLeaf && tree.continueProcess === 'root') ||
  tree.continueProcess === 'rightSkew';

function constructBinaryTreeFromPrePostOrder<T>(option: InPreOrderOption<T>) {
  if (!orderItemsorderSame(option.preorder, option.inorder)) {
    throw new TypeError(
      'The list provided for the preorder and inorder has a mismatch'
    );
  }

  const constructInfoStack = createStack<ConstructBinaryTreeInfo<T>>(null);
  const { inorder, preorder, orderCheck = Object.is } = option;
  let currentInorder = inorder;

  iterableLoop<T>(preorder, (item) => {
    let childTreeInfo = getTreeInfo(item, currentInorder, orderCheck);
    if (!childTreeInfo) {
      throw new Error(
        `This is an internal error which should not be happening. If noticed file a bug issue.`
      );
    }

    let rootTreeInfo = constructInfoStack.peek();
    let hasReachLeaf = detectLeaf(childTreeInfo);
    let continueBackTrack = false;

    while (rootTreeInfo && (hasReachLeaf || continueBackTrack)) {
      let currentTree = childTreeInfo.root.node;
      const rootTree = rootTreeInfo.info.root;

      if (startBackTrackFromLeft(rootTreeInfo, hasReachLeaf)) {
        rootTree.node.left = currentTree;
        if (rootTreeInfo.continueProcess !== 'leftSkew') {
          rootTreeInfo.continueProcess = 'rightSkew';
          return (currentInorder = rootTreeInfo.info.subTree.rightMembers);
        }
      } else if (startBackTrackFromRight(rootTreeInfo, hasReachLeaf)) {
        rootTree.node.right = currentTree;
      } else {
        throw new Error('Invalid backtracking or traversing process');
      }
      constructInfoStack.pop();
      childTreeInfo = rootTreeInfo.info;
      rootTreeInfo = constructInfoStack.peek();
      continueBackTrack = allowBackTrack(rootTreeInfo?.continueProcess);
    }
    const info = createBinaryTreeInfo(childTreeInfo);
    constructInfoStack.push(info);
    if (
      info.continueProcess === 'right' ||
      info.continueProcess === 'leftSkew'
    ) {
      currentInorder = childTreeInfo.subTree.leftMembers;
    } else if (info.continueProcess === 'rightSkew') {
      currentInorder = childTreeInfo.subTree.rightMembers;
    }
  });

  if (constructInfoStack.size === 1) {
    return constructInfoStack.pop().info.root.node;
  }

  throw new Error(
    `stack should only remain a single tree which should be the root Tree.
    This might be caused by the invalid provided order in the either preorder or inorder list `
  );
}

const getNthOrderItem = <T>(order: ListBinaryFrom<T>, nth: number) =>
  order.at(nth);

const getFirstorderItem = <T>(preorder: ListBinaryFrom<T>) =>
  getListFirstItem(preorder);
const getLastorderItem = <T>(inorder: ListBinaryFrom<T>) =>
  getListLastItem(inorder);
const getTreeOrderTypeSize = (order: ListBinaryFrom<any>) => getListSize(order);

const checkPrePostOrderValidity = (option: InPreOrderOption<any>) => {
  const { inorder, preorder } = option;
  const preOrderSize = getTreeOrderTypeSize(preorder);
  const postOrderSize = getTreeOrderTypeSize(inorder);
  const bothOrderAreEmpty = preOrderSize === 0;

  return (
    preOrderSize === postOrderSize &&
    (bothOrderAreEmpty ||
      getFirstorderItem(preorder) === getLastorderItem(inorder))
  );
};

const constructBinaryTreeFromPrePosOrder = <T>(option: InPreOrderOption<T>) => {
  if (!checkPrePostOrderValidity(option)) {
    throw new TypeError(
      'Both order list i.e preorder or inorder is incompatible.That is a mismatch is found.'
    );
  }
  const preorder = option.preorder;

  let isLeafNode = false;
  if (
    isEmptyTreeOrder(preorder) ||
    (isLeafNode = getTreeOrderTypeSize(preorder) === 1)
  ) {
    return isLeafNode ? createBinaryTree(getFirstorderItem(preorder)) : null;
  }

  const rootNode = createBinaryTree(getFirstorderItem(preorder));
  const members = getTreeMembers(getNthOrderItem(preorder, 1)!, option)!;
  members.leftMembers;
  rootNode.left =
    constructBinaryTreeFromPrePosOrder(members.leftMembers) ?? null;
  rootNode.right =
    constructBinaryTreeFromPrePosOrder(members.rightMembers) ?? null;
  return rootNode;
};

export { constructBinaryTreeFromPrePostOrder };
