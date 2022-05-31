import { DoublyLinkedList } from './type';
import { linkListRebuilder } from './util.js';
import { _createDoublyLinkedList } from './_doublyLinkedList.js';

export function createDoublyLinkedList<T>(
  initialData?: T | Array<T>
): DoublyLinkedList<T> {
  return Object.assign(
    _createDoublyLinkedList<T>({
      isCircular: false,
      ...(initialData != undefined ? { initialData: initialData } : null),
    }),
    linkListRebuilder(createDoublyLinkedList)
  );
}
