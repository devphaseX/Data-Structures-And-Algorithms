import type { BinaryTree } from '../../data_structure/tree/shared.types';
import { findLeafNodes } from './findLeafNodes';

const findLeafNodeSize = (tree: BinaryTree<any>) => findLeafNodes(tree).length;
export { findLeafNodeSize };
