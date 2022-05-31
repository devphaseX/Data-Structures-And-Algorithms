import {
  LinkListType,
  NodeReference,
} from './../../data_structure/linkedList/type';
import { getLinkedNodeReq } from './shared';

function isLinkedListLengthOddOrEven<T>(
  linkedList: LinkListType<T> | NodeReference<T>
) {
  const result = getLinkedNodeReq(linkedList);

  let isOdd = { odd: false };
  let isEven = { even: false };

  if (!result) {
    isEven.even = true;
    return { ...isEven, ...isOdd };
  } else {
    if (result.length % 2 === 0) {
      isEven.even = true;
    } else {
      isOdd.odd = true;
    }

    return { ...isEven, ...isOdd };
  }
}

export default isLinkedListLengthOddOrEven;
