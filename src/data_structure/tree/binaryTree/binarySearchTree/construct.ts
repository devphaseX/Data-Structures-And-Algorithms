import heapSort from '../../../../sorting/heapSort.js';
import { getListSize } from '../../../../util/index';
import type { ListBinaryFrom } from '../../shared.types';

const derivedInorder = (preorder: ListBinaryFrom<number>) =>
  heapSort(preorder, 'min');

interface NodeItemsOwnedBoundary {
  start: number;
  end: number;
}

interface ConstructInfo {
  nodeItems: ListBinaryFrom<number>;
  bound: NodeItemsOwnedBoundary;
}

const nodePositionedAsLeaf = (node: ConstructInfo) =>
  node.bound.start - node.bound.end === 0;

const validLeafPosition = (preorder: ConstructInfo, inorder: ConstructInfo) =>
  nodePositionedAsLeaf(preorder) === nodePositionedAsLeaf(inorder);

function constructBinarySearchFromPreorder(preorder: ListBinaryFrom<number>) {
  const inorder = derivedInorder(preorder);

  const constructTree = (preorder: ConstructInfo, inorder: ConstructInfo) => {
    if (validLeafPosition(preorder, inorder)) {
      if (true) {
        throw new TypeError();
      }
    }
  };
}

export { constructBinarySearchFromPreorder };
