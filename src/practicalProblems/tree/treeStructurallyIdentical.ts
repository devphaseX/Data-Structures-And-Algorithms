import { BinaryTree } from '../../data_structure/tree/shared.types';

function compareTreeStructure<T>(
  treeOne: BinaryTree<T> | null | undefined,
  treeTwo: BinaryTree<T> | null | undefined,
  comparer: (valueOne: T, valueTwo: T) => boolean
): boolean {
  if (treeOne === treeTwo && treeOne === null) return true;
  if ((treeOne === null && treeTwo) || (treeOne && treeTwo === null))
    return false;

  return (
    comparer(treeOne!.value, treeTwo!.value) &&
    compareTreeStructure(treeOne?.left, treeTwo?.right, comparer)
  );
}

export { compareTreeStructure };
