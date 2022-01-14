import { CircularDoublyLinkedList } from "./type";
import { _createDoublyLinkedList } from "./_doublyLinkedList.js";

export function createCircularDoublyLinkedList<T>(
  initialData?: T
): CircularDoublyLinkedList<T> {
  return _createDoublyLinkedList<T>({
    isCircular: true,
    ...(initialData ? { initialData: initialData } : null),
  });
}
