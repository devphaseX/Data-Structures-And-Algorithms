import { CircularLinkedList } from './type';
import { _createSinglyLinkedList } from './_singlyLinkedList.js';

export function createCircularLinkedList<T>(initialData?: T | Array<T>) {
  return _createSinglyLinkedList<T>({
    isCircular: true,
    ...(initialData ? { initialData: initialData } : null),
  }) as CircularLinkedList<T>;
}
