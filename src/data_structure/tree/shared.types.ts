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

type TreeTraversalFn<T> = (value: T) => void;

type ListBinaryFrom<T> = Array<T>;

export type {
  ListBinaryFrom,
  BinaryTree,
  TreeTraversalFn,
  InternalBinaryNode,
  LeftSkewTree,
  RightSkewTree,
  SkewTree,
};
