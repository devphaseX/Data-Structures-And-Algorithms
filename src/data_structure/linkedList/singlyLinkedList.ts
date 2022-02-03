import { SinglyLinkedList } from './type';
import { _createSinglyLinkedList } from './_singlyLinkedList.js';

export function createSinglyLinkedList<T>(
  initialData?: T | Array<T>
): SinglyLinkedList<T> {
  return _createSinglyLinkedList<T>({
    isCircular: false,
    ...(initialData != undefined ? { initialData: initialData } : null),
  });
}
