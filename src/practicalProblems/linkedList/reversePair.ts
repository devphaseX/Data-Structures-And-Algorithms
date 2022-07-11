import { detectCircularNode } from '../../data_structure/linkedList/util.js';
import createQueue from '../../data_structure/queue/index.js';
import {
  LinkListType,
  NodeReference,
} from './../../data_structure/linkedList/type';
import { createQueueRepOfLinkedNode } from './shared.js';

function reverseLinkedNodeInPair<T>(
  linkedList: LinkListType<T>,
  allowMutate?: boolean
) {
  const queueLinkedNodesRep = createQueueRepOfLinkedNode(linkedList);
  if (linkedList.head && detectCircularNode(linkedList.head)) {
    throw new TypeError('Cannot operate on a circular node.');
  }

  if (queueLinkedNodesRep.isEmpty() || queueLinkedNodesRep.size() < 2) {
    return linkedList;
  }

  const pairsQueue = createQueue<NodeReference<T>>(null);
  if (!allowMutate) {
    linkedList = linkedList.mapNode((v) => v);
  }

  while (!queueLinkedNodesRep.isEmpty()) {
    let firstInPair = queueLinkedNodesRep.dequeue()!;
    let secondInPair = queueLinkedNodesRep.dequeue();

    if (secondInPair) {
      secondInPair.next = firstInPair;
      pairsQueue.enqueue(secondInPair);
    } else if (firstInPair) {
      pairsQueue.enqueue(firstInPair);
    } else break;
  }

  let head = pairsQueue.peek();
  {
    let last!: NodeReference<T>;

    while (!pairsQueue.isEmpty()) {
      const firstNodeEntry = pairsQueue.dequeue()!;
      const secondNodeEntry = pairsQueue.peek();

      if (secondNodeEntry) {
        firstNodeEntry.next!.next = secondNodeEntry;
      } else last = firstNodeEntry;
    }

    if (last.next?.next) {
      last.next.next = null;
    }
  }

  linkedList.emptyLinkedList();
  linkedList.merge(head);

  return head;
}

export default reverseLinkedNodeInPair;
