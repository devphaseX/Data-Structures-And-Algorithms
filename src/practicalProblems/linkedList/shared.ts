import {
  NodeReference,
  LinkListType,
} from './../../data_structure/linkedList/type';
import { createSinglyLinkedList } from '../../data_structure/linkedList/singlyLinkedList.js';
import createStack from '../../data_structure/stack/index.js';
import { unary } from '../../util/index.js';
import {
  detectCircularNode,
  tranverseNode,
} from '../../data_structure/linkedList/util.js';
import createQueue from '../../data_structure/queue/index';

function getLinkedNodeReq<T>(linkedList: LinkListType<T> | NodeReference<T>) {
  const isHeadUnwrapped = 'head' in linkedList;
  const unwrapLinkedList = isHeadUnwrapped ? linkedList.head : linkedList;

  if (!unwrapLinkedList) return unwrapLinkedList;

  const length = isHeadUnwrapped
    ? linkedList.size
    : createSinglyLinkedList<T>().merge(linkedList as any).size;
  return { unwrapLinkedList, length };
}

function createstackRepOfLinkedNode<T>(linkedNode: LinkListType<T>) {
  return createStack<NodeReference<T>>((push) => {
    if (!linkedNode.head) return 0;
    tranverseNode(linkedNode.head, unary(push), {
      isCircular: detectCircularNode(linkedNode.head),
    });
    return linkedNode.size;
  }, Infinity);
}

function createQueueRepOfLinkedNode<T>(linkedNode: LinkListType<T>) {
  return createQueue<NodeReference<T>>((enqueue) => {
    if (!linkedNode.head) return 0;
    tranverseNode(linkedNode.head, unary(enqueue), {
      isCircular: detectCircularNode(linkedNode.head),
    });
    return linkedNode.size;
  });
}

export {
  getLinkedNodeReq,
  createstackRepOfLinkedNode,
  createQueueRepOfLinkedNode,
};
