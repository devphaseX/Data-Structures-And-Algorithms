import createStack from '../../data_structure/stack/index';
import { BinaryTree } from '../../data_structure/tree/shared.types';
import levelorderTraversal from '../../data_structure/tree/traversal/levelorder';

function printLevelOrderInReverse<T>(
  tree: BinaryTree<T>,
  logger: (value: T) => void
) {
  const reverseStoredItem = createStack<T>(null);

  if (!tree) return;
  levelorderTraversal<T>(tree, reverseStoredItem.push);
  reverseStoredItem.flush(logger);
}

export default printLevelOrderInReverse;
