import { DoublyLinkedList, RebuildFn } from './type';
import { makeLinkedConfigurable } from './util.js';
import { _createDoublyLinkedList } from './_doublyLinkedList.js';

export function createDoublyLinkedList<T>(
  initialData?: T | Array<T>
): DoublyLinkedList<T> {
  return _createDoublyLinkedList(
    makeLinkedConfigurable(false, initialData),
    createDoublyLinkedList as RebuildFn
  );
}
