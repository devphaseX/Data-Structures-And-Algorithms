import { isNodeLeaf } from '../../data_structure/tree/shared';
import { BinaryTree } from '../../data_structure/tree/shared.types';
import levelorderTraversal from '../../data_structure/tree/traversal/levelorder';
import { iterWithRecurApproach } from './../../util/index';

export default iterWithRecurApproach({
  recur: function findTreeSize(tree: BinaryTree<any>): number {
    if (isNodeLeaf(tree)) return 1;
    return findTreeSize(tree.left!) + 1 + findTreeSize(tree.right!);
  },
  iter: function (tree: BinaryTree<any>) {
    let size = 0;
    levelorderTraversal(tree, () => (size += 1));
    return size;
  },
});
