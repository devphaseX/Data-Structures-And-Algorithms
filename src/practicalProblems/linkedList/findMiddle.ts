import {
  detectCircularNode,
  tranverseNode,
} from '../../data_structure/linkedList/util';
import { getMiddlePoint } from '../../util/index.js';
import {
  LinkListType,
  NodeReference,
} from './../../data_structure/linkedList/type';
import { getLinkedNodeReq } from './shared.js';

function findMiddle<T>(linkedList: LinkListType<T> | NodeReference<T>) {
  const requirement = getLinkedNodeReq(linkedList);
  if (!requirement) return requirement;

  const { unwrapLinkedList, length } = requirement;
  let middle!: NodeReference<T>;
  let middlePointIndex = getMiddlePoint(0, length);

  tranverseNode(
    unwrapLinkedList,
    (node, i, { abortTarversal }) => {
      if (i === middlePointIndex) {
        middle = node;
        return abortTarversal();
      }
    },
    {
      isCircular: detectCircularNode(unwrapLinkedList),
    }
  );

  return middle;
}

function findMiddleUsingPointer<T>(
  linkedList: LinkListType<T> | NodeReference<T>
) {
  const result = getLinkedNodeReq(linkedList);
  if (!result) return result;

  const { unwrapLinkedList: head } = result;
  let fastP = (head as NodeReference<T> | null) ?? null;
  let slowP = fastP;

  while (fastP && fastP.next) {
    fastP = fastP.next.next ?? null;
    slowP = slowP?.next ?? null;

    if (fastP === null) {
      return slowP;
    }
  }

  return head;
}

export { findMiddle as findMiddleNaive, findMiddleUsingPointer };
