interface BinaryTree<T> {
  value: T;
  left?: BinaryTree<T> | null;
  right?: BinaryTree<T> | null;
}

type TreeTraversalFn<T> = (value: T) => void;

export type { BinaryTree, TreeTraversalFn };
