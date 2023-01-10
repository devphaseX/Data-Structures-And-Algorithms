import { BinaryTree } from '../../data_structure/tree/shared.types';
import { findHalfNodes } from './findHalfNodes';

const findHalfNodesSize = (tree: BinaryTree<any>) => findHalfNodes(tree).length;

export { findHalfNodesSize };
