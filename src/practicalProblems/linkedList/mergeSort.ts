import { lessThan } from '../../util/index.js';
import { LinkListType } from './../../data_structure/linkedList/type';
import { createQueueRepOfLinkedNode } from './shared.js';

/*
  Given two sorted Linked Lists, how to merge them into the third list in sorted 
  order?
 */

function mergeLinkedListUsingSort<T extends LinkListType<any>>(
  first: T,
  second: T
) {
  const queueRepOne = createQueueRepOfLinkedNode(first);
  const queueRepTwo = createQueueRepOfLinkedNode(second);

  const queueRepCombine = first.rebuild();

  while (!queueRepOne.isEmpty() && !queueRepTwo.isEmpty()) {
    const queueValueOne = queueRepOne.peek()!.data;
    const queueValueTwo = queueRepTwo.peek()!.data;

    if (lessThan.equal.check(queueValueOne, queueValueTwo)) {
      queueRepOne.dequeue();
      queueRepCombine.appendNode(queueValueOne);
    } else {
      queueRepTwo.dequeue();
      queueRepCombine.appendNode(queueValueTwo);
    }
  }

  queueRepOne.flush(({ data }) => {
    queueRepCombine.appendNode(data);
  });

  queueRepTwo.flush(({ data }) => {
    queueRepCombine.appendNode(data);
  });

  return queueRepCombine;
}

export default mergeLinkedListUsingSort;
