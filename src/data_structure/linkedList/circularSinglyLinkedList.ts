import { CircularLinkedList } from './type';
import { linkListRebuilder } from './util.js';
import { _createSinglyLinkedList } from './_singlyLinkedList.js';

export function createCircularLinkedList<T>(initialData?: T | Array<T>) {
  return Object.assign(
    _createSinglyLinkedList<T>({
      isCircular: true,
      ...(initialData ? { initialData: initialData } : null),
    }) as CircularLinkedList<T>,
    linkListRebuilder(createCircularLinkedList)
  );
}
