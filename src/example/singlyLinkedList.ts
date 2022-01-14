import { createSinglyLinkedList } from "../linkedList/singlyLinkedList.js";
import { createCircularLinkedList } from "../linkedList/circularSinglyLinkedList.js";
import { createDoublyLinkedList } from "../linkedList/doublyLinkedList.js";

// const singly = createSinglyLinkedList(1);
const circularSingly = createCircularLinkedList([1, 2, 3, 4, 5]);
// circularSingly.appendNode();
const newImmutable = circularSingly.appendNode(2, true);
console.log(newImmutable.head);
