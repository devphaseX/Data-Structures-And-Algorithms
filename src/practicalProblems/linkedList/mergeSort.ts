import { lessThan } from '../../util/index.js';
import { LinkListType } from './../../data_structure/linkedList/type';
import { createQueueRepOfLinkedNode } from './shared.js';

/*
  Given two sorted Linked Lists, how to merge them into the third list in sorted 
  order?
 */

function mergeLinkedListUsingSort<LinkList extends LinkListType<any>>(
  leadingLinkList: LinkList,
  trailingLinkList: LinkList
) {
  const queueLeadingRep = createQueueRepOfLinkedNode(leadingLinkList);
  const queueTrailingRep = createQueueRepOfLinkedNode(trailingLinkList);

  const queueLinkMergeRep = leadingLinkList.rebuild();

  while (!queueLeadingRep.isEmpty() && !queueTrailingRep.isEmpty()) {
    const queueValueOne = queueLeadingRep.peek()!.data;
    const queueValueTwo = queueTrailingRep.peek()!.data;

    if (lessThan.equal.check(queueValueOne, queueValueTwo)) {
      queueLeadingRep.dequeue();
      queueLinkMergeRep.appendNode(queueValueOne);
    } else {
      queueTrailingRep.dequeue();
      queueLinkMergeRep.appendNode(queueValueTwo);
    }
  }

  queueLeadingRep.flush(({ data }) => {
    queueLinkMergeRep.appendNode(data);
  });

  queueTrailingRep.flush(({ data }) => {
    queueLinkMergeRep.appendNode(data);
  });

  return queueLinkMergeRep;
}

export default mergeLinkedListUsingSort;
