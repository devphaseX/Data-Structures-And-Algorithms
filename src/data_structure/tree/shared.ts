import { BinaryTree } from './shared.types';

function unwrapTreeValue<T>(value: BinaryTree<T>) {
  return value.value;
}

export { unwrapTreeValue };
