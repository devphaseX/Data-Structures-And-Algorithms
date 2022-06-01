import { RebuildFn, SinglyLinkedList } from './type';
import { makeLinkedConfigurable } from './util.js';
import { _createSinglyLinkedList } from './_singlyLinkedList.js';

export function createSinglyLinkedList<T>(
  initialData?: T | Array<T>
): SinglyLinkedList<T> {
  return _createSinglyLinkedList(
    makeLinkedConfigurable(false, initialData),
    createSinglyLinkedList as RebuildFn
  );
}
