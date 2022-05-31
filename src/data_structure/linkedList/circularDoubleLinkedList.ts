import { CircularDoublyLinkedList } from './type';
import { linkListRebuilder } from './util.js';
import { _createDoublyLinkedList } from './_doublyLinkedList.js';

export function createCircularDoublyLinkedList<T>(initialData?: T | Array<T>) {
  return Object.assign(
    _createDoublyLinkedList<T>({
      isCircular: true,
      ...(initialData != undefined ? { initialData: initialData } : null),
    }) as CircularDoublyLinkedList<T>,
    linkListRebuilder(createCircularDoublyLinkedList)
  );
}
