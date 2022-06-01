import { CircularLinkedList, RebuildFn } from './type';
import { makeLinkedConfigurable } from './util.js';
import { _createSinglyLinkedList } from './_singlyLinkedList.js';

export function createCircularLinkedList<T>(
  initialData?: T | Array<T>
): CircularLinkedList<T> {
  return _createSinglyLinkedList(
    makeLinkedConfigurable(true, initialData),
    createCircularLinkedList as RebuildFn
  ) as CircularLinkedList<T>;
}
