import { LinkListType } from './../../data_structure/linkedList/type';
import { createQueueRepOfLinkedNode } from './shared';
function mergeLinkedListUsingSort<T extends LinkListType<any>>(
  first: T,
  second: T
) {
  const qf = createQueueRepOfLinkedNode(first);
  const qs = createQueueRepOfLinkedNode(second);

  const r = first.reBuild();

  while (!qf.isEmpty() && !qs.isEmpty()) {
    const f = qf.peek()!.data;
    const s = qs.peek()!.data;

    if (f > s) {
      qf.dequeue();
      r.appendNode(f);
    } else {
      qs.dequeue();
      r.appendNode(s);
    }
  }

  qf.flush(({ data }) => {
    r.appendNode(data);
  });

  qs.flush(({ data }) => {
    r.appendNode(data);
  });

  return r;
}

export default mergeLinkedListUsingSort;
