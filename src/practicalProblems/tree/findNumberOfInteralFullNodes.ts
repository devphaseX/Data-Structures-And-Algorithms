import { BinaryTree } from '../../data_structure/tree/shared.types';
import { findInternalFullNodes } from './findInternalNodes';

const findInternalFullNodesSize = (tree: BinaryTree<any>) =>
  findInternalFullNodes(tree).length;

export { findInternalFullNodesSize };
