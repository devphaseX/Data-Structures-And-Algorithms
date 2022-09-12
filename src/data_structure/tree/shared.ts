import { not } from '../../util/index';
import {
  BinaryTree,
  InternalBinaryNode,
  LeftSkewTree,
  RightSkewTree,
} from './shared.types';

function unwrapTreeValue<T>(value: BinaryTree<T>) {
  return value.value;
}

function isNodeLeaf(node: BinaryTree<any>) {
  return !node.left && !node.right;
}

const isNodeInternal = not(isNodeLeaf) as (
  node: BinaryTree<any>
) => node is InternalBinaryNode<any>;

const isTreeLeftSkew = <T>(node: BinaryTree<T>): node is LeftSkewTree<T> =>
  !!node.left && !node.right;

const isTreeRightSkew = <T>(node: BinaryTree<T>): node is RightSkewTree<T> =>
  !node.left && !!node.right;

export {
  unwrapTreeValue,
  isNodeLeaf,
  isNodeInternal,
  isTreeLeftSkew,
  isTreeRightSkew,
};
