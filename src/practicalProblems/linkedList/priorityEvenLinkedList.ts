import { isEven } from '../../util/index.js';
import { LinkListType } from './../../data_structure/linkedList/type';

function prioritizeEvenOverOddLinkedList(linkedList: LinkListType<number>) {
  const evenLinkedList = linkedList.rebuild();
  const oddLinkedList = linkedList.rebuild();

  linkedList.forEach((value) => {
    if (Number.isInteger(value)) {
      if (isEven(value)) {
        evenLinkedList.appendNode(value);
      } else {
        oddLinkedList.appendNode(value);
      }
    }
  }, 'head');

  return evenLinkedList.merge(oddLinkedList);
}

export default prioritizeEvenOverOddLinkedList;
