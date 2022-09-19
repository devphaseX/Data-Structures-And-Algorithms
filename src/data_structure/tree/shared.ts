import { not } from '../../util/index.js';
import {
  BinaryTree,
  InternalBinaryNode,
  LeftSkewTree,
  RightSkewTree,
} from './shared.types';

function unwrapNodeTreeValue<T>(value: BinaryTree<T>) {
  return value.value;
}

function isNodeLeaf(node: BinaryTree<any>) {
  return !node.left && !node.right;
}

type InternalBinaryNodePredicateFn<T> = (
  node: BinaryTree<T>
) => node is InternalBinaryNode<T>;

const isNodeInternal = not(isNodeLeaf) as InternalBinaryNodePredicateFn<any>;

const isTreeLeftSkew = <T>(node: BinaryTree<T>): node is LeftSkewTree<T> =>
  !!node.left && !node.right;

const isTreeRightSkew = <T>(node: BinaryTree<T>): node is RightSkewTree<T> =>
  !node.left && !!node.right;

function createBinaryTree<T>(value: T): BinaryTree<T> {
  return { value };
}

export {
  createBinaryTree,
  unwrapNodeTreeValue,
  isNodeLeaf,
  isNodeInternal,
  isTreeLeftSkew,
  isTreeRightSkew,
};
