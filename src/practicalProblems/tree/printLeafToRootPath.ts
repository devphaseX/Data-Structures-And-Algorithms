import type { BinaryTree } from '../../data_structure/tree/shared.types';

type TreePath<T> = T[];
type GetRootPathValue<T, U> = (tree: BinaryTree<T>) => U;
type OnPathFn<T> = (path: TreePath<T>) => void;

function getLeafToRootPath<T, U>(
  tree: BinaryTree<T> | null | undefined,
  getRootPathValue: GetRootPathValue<T, U>,
  onPath?: OnPathFn<U>
): void {
  function _getLeaftToRootPath(
    tree: BinaryTree<T> | null | undefined,
    paths: Array<U> = []
  ): void {
    if (!tree) return;
    const currentPath = paths.concat(getRootPathValue(tree));
    onPath?.(currentPath);
    _getLeaftToRootPath(tree.left, currentPath);
    _getLeaftToRootPath(tree.right, currentPath);
  }

  return _getLeaftToRootPath(tree);
}

export { getLeafToRootPath };
