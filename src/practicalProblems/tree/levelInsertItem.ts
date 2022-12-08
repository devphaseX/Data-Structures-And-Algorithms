import {
  createBinaryTree,
  isFullNode,
  isTreeLeftSkew,
} from '../../data_structure/tree/shared';
import { BinaryTree } from '../../data_structure/tree/shared.types';
import levelorderTraversal from '../../data_structure/tree/traversal/levelorder';

function insertBinaryItemUsingLevelOrder<T>(tree: BinaryTree<T>, item: T) {
  levelorderTraversal(tree, (_, lastNode) => {
    if (isFullNode(lastNode)) return;

    const insertTreeDirection = isTreeLeftSkew(lastNode) ? 'right' : 'left';
    tree[insertTreeDirection] = createBinaryTree(item);
  });
  return tree;
}

export default insertBinaryItemUsingLevelOrder;
