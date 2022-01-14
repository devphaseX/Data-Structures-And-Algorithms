import { CircularLinkedList } from "./type";
import { _createSinglyLinkedList } from "./_singlyLinkedList.js";

export function createCircularLinkedList<T>(
  initialData?: T | Array<T>
): CircularLinkedList<T> {
  return _createSinglyLinkedList<T>({
    isCircular: true,
    ...(initialData ? { initialData: initialData } : null),
  });
}
