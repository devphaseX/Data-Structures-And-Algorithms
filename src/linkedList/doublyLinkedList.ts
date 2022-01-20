import { DoublyLinkedList } from './type';
import { _createDoublyLinkedList } from './_doublyLinkedList.js';

export function createDoublyLinkedList<T>(
  initialData?: T | Array<T>
): DoublyLinkedList<T> {
  return _createDoublyLinkedList<T>({
    isCircular: false,
    ...(initialData != undefined ? { initialData: initialData } : null),
  });
}
