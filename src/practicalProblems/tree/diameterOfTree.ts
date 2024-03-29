import { BinaryTree } from '../../data_structure/tree/shared.types';

function getTreeDiameter(tree: BinaryTree<any> | null | undefined) {
  function _getTreeDiamter(
    _tree: typeof tree,
    diameter = { count: 0 }
  ): number {
    if (!_tree) return 0;
    const left = _getTreeDiamter(_tree.left, diameter);
    const right = _getTreeDiamter(_tree.right, diameter);

    if (left + right > diameter.count) {
      diameter.count = left + right;
    }

    return Math.max(left, right) + 1;
  }

  return _getTreeDiamter(tree);
}

export { getTreeDiameter };
