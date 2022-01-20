import { CircularDoublyLinkedList } from './type';
import { _createDoublyLinkedList } from './_doublyLinkedList.js';

export function createCircularDoublyLinkedList<T>(initialData?: T | Array<T>) {
  return _createDoublyLinkedList<T>({
    isCircular: true,
    ...(initialData != undefined ? { initialData: initialData } : null),
  }) as CircularDoublyLinkedList<T>;
}
