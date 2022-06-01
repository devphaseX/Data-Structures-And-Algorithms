import { CircularDoublyLinkedList, RebuildFn } from './type';
import { makeLinkedConfigurable } from './util.js';
import { _createDoublyLinkedList } from './_doublyLinkedList.js';

export function createCircularDoublyLinkedList<T>(
  initialData?: T | Array<T>
): CircularDoublyLinkedList<T> {
  return _createDoublyLinkedList(
    makeLinkedConfigurable(true, initialData),
    createCircularDoublyLinkedList as RebuildFn
  ) as CircularDoublyLinkedList<T>;
}
