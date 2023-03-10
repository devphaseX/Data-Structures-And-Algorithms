import { GenericNode } from '../../data_structure/tree/generic';

const findSum = (node?: GenericNode<number> | null): number => {
  if (!node) return 0;

  return node.value + findSum(node.firstChild) + findSum(node.nextSibling);
};

export { findSum };
