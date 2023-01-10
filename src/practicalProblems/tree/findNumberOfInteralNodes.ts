import { BinaryTree } from '../../data_structure/tree/shared.types';
import { findInternalNodes } from './findInternalNodes';

const findInternalNodesSize = (tree: BinaryTree<any>) =>
  findInternalNodes(tree).length;

export { findInternalNodesSize };
