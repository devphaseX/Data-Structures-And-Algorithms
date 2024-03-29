interface Valuable<T> {
  value: T;
}

interface BinaryTree<T> extends Valuable<T> {
  left?: BinaryTree<T> | null;
  right?: BinaryTree<T> | null;
}

type InternalBinaryNode<T> = Valuable<T> & {
  [K in keyof BinaryTree<T> as K extends 'value' ? never : K]-?: NonNullable<
    BinaryTree<T>[K]
  >;
};

interface LeafTree<T> extends BinaryTree<T> {
  left?: null;
  right?: null;
}

type LeftSkewTree<T> = Valuable<T> & {
  [K in keyof BinaryTree<T> as K extends 'left' ? K : never]-?: NonNullable<
    BinaryTree<T>[K]
  >;
} & BinaryTree<T>;

type RightSkewTree<T> = Valuable<T> & {
  [K in keyof BinaryTree<T> as K extends 'right' ? K : never]-?: NonNullable<
    BinaryTree<T>[K]
  >;
} & BinaryTree<T>;

type SkewTree<T> = LeftSkewTree<T> | RightSkewTree<T>;

type TreeTraversalFn<T> = (value: T, raw: BinaryTree<T>) => void;

type ListBinaryFrom<T> = Array<T>;

interface __InternalBinarySearchTree<T> {
  insert: (
    value: T,
    observe?: (payload: { node: BinaryTree<T>; value: T }) => void
  ) => BinaryTree<T>;
}

interface BinarySearchTree<T> {
  insert(value: T): BinaryTree<T>;
  addChangeImmutable(
    immutablecontext: (tree: BinarySearchTree<T>) => void
  ): BinarySearchTree<T>;
  deleteItem(value: T): BinaryTree<T> | null;
  __: __InternalBinarySearchTree<T>;
}

type TraverseTreeCheck<T> = (currentRoot: T, currentTraverseRoot: T) => boolean;

interface InPreOrderOption<T> {
  preorder: Array<T>;
  inorder: Array<T>;
  orderCheck?: TraverseTreeCheck<T>;
}

interface PreInMembers<T> {
  preorder: ListBinaryFrom<T>;
  inorder: ListBinaryFrom<T>;
}
interface PreInTreeMember<T> {
  leftMembers: PreInMembers<T>;
  rightMembers: PreInMembers<T>;
}
interface TreeMemberInfo<T> {
  subTree: {
    leftMembers: ListBinaryFrom<T>;
    rightMembers: ListBinaryFrom<T>;
  };
  root: { node: BinaryTree<T>; position: number };
}

export type {
  TreeMemberInfo,
  TraverseTreeCheck,
  InPreOrderOption,
  PreInMembers,
  PreInTreeMember,
  BinarySearchTree,
  ListBinaryFrom,
  BinaryTree,
  TreeTraversalFn,
  InternalBinaryNode,
  LeftSkewTree,
  RightSkewTree,
  SkewTree,
  LeafTree,
};
