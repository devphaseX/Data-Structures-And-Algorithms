import { SinglyLinkedList } from './type';
import { linkListRebuilder } from './util.js';
import { _createSinglyLinkedList } from './_singlyLinkedList.js';

export function createSinglyLinkedList<T>(
  initialData?: T | Array<T>
): SinglyLinkedList<T> {
  return Object.assign(
    _createSinglyLinkedList<T>({
      isCircular: false,
      ...(initialData != undefined ? { initialData: initialData } : null),
    }),
    linkListRebuilder(createSinglyLinkedList)
  );
}
