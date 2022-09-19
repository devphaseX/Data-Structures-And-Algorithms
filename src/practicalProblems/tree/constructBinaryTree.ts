import createStack from '../../data_structure/stack/index.js';
import { createBinaryTree } from '../../data_structure/tree/shared.js';
import {
  BinaryTree,
  ListBinaryFrom,
} from '../../data_structure/tree/shared.types.js';
import {
  getListSymmetricDif,
  iterableLoop,
  not,
  outOfRange,
} from '../../util/index.js';

interface PrePostOrderOption<T> {
  preorder: Array<T>;
  inorder: Array<T>;
  orderCheck: TraverseTreeCheck<T>;
}

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

function getTreeFormDifference<T>(
  firstForm: ListBinaryFrom<T>,
  secondForm: ListBinaryFrom<T>
) {
  return getListSymmetricDif(firstForm, secondForm);
}

const checkTreeOrdersSameness = <T>(
  firstForm: ListBinaryFrom<T>,
  secondForm: ListBinaryFrom<T>
) =>
  [
    getTreeFormDifference(firstForm, secondForm),
    getTreeFormDifference(secondForm, firstForm),
  ].every((symDif) => symDif.length === 0);

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

function isLeftSkewTree(subTree: TreeMemberInfo<any>['subTree']) {
  return !!(subTree.leftMembers.length && subTree.rightMembers.length === 0);
}

function isRightSkewTree(subTree: TreeMemberInfo<any>['subTree']) {
  return !!(subTree.rightMembers.length && subTree.leftMembers.length === 0);
}

function getTreeContinueStatus(
  treeInfo: TreeMemberInfo<any>
): ContinueTreeTraversalProcessType {
  return isLeftSkewTree(treeInfo.subTree)
    ? 'leftSkew'
    : isRightSkewTree(treeInfo.subTree)
    ? 'rightSkew'
    : 'right';
}

const createBinaryTreeInfo = <T>(
  info: TreeMemberInfo<T>
): ConstructBinaryTreeInfo<T> => ({
  info,
  continueProcess: getTreeContinueStatus(info),
});

type TraverseTreeCheck<T> = (currentRoot: T, currentTraverseRoot: T) => boolean;

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
  tree.subTree.leftMembers.length === 0 &&
  tree.subTree.rightMembers.length === 0;

const allowBackTrack = (processType: string | undefined | null) =>
  !processType || backTrackTraversalTypes.includes(processType as any);

function constructBinaryTreeFromPrePostOrder<T>(option: PrePostOrderOption<T>) {
  if (!checkTreeOrdersSameness(option.preorder, option.inorder)) {
    throw new TypeError();
  }
  const constructInfoStack = createStack<ConstructBinaryTreeInfo<T>>(null);
  const { inorder, preorder, orderCheck = Object.is } = option;
  let currentInorder = inorder;

  iterableLoop<T>(preorder, (item) => {
    let childTreeInfo = getTreeInfo(item, currentInorder, orderCheck);
    if (!childTreeInfo) {
      return;
    }

    let parentTreeInfo = constructInfoStack.peek();
    let hasReachLeaf = detectLeaf(childTreeInfo);
    let continueBackTrack = false;
    while (parentTreeInfo && (hasReachLeaf || continueBackTrack)) {
      const {
        info: { root: currentTreeRoot },
        continueProcess,
      } = parentTreeInfo;
      let currentTree = childTreeInfo.root.node;
      const backTrackFromLeft = () =>
        (hasReachLeaf && continueProcess === 'right') ||
        continueProcess === 'leftSkew';
      const backTrackFromRight = () =>
        (hasReachLeaf && continueProcess === 'root') ||
        continueProcess === 'rightSkew';

      if (backTrackFromLeft()) {
        parentTreeInfo.info.root.node.left = currentTree;
        if (continueProcess !== 'leftSkew') {
          parentTreeInfo.continueProcess = 'rightSkew';
          return (currentInorder = parentTreeInfo.info.subTree.rightMembers);
        }
      } else if (backTrackFromRight()) {
        currentTreeRoot.node.right = currentTree;
      }
      constructInfoStack.pop();
      childTreeInfo = parentTreeInfo.info;
      parentTreeInfo = constructInfoStack.peek();
      continueBackTrack = allowBackTrack(parentTreeInfo?.continueProcess);
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

  debugger;
  if (constructInfoStack.size === 1) {
    return constructInfoStack.pop().info.root.node;
  }
  throw new TypeError();
}

export { constructBinaryTreeFromPrePostOrder };
