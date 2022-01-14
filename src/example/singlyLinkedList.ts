import { createSinglyLinkedList } from "../linkedList/singlyLinkedList.js";
import { createCircularLinkedList } from "../linkedList/circularSinglyLinkedList.js";
import { createDoublyLinkedList } from "../linkedList/doublyLinkedList.js";

// const singly = createSinglyLinkedList(1);
const doubly = createDoublyLinkedList([1, 2, 3, 5, 6]);
// circularSingly.appendNode();
// const newImmutable = circularSingly.appendNode(2, true);
// newImmutable.removeLastNode(true);
// newImmutable.removeLastNode();
doubly.removeFirstNode();
doubly.removeFirstNode();

// doubly.removeLastNode();

console.log(doubly.head);
