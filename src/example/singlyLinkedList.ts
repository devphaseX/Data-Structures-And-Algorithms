import { createSinglyLinkedList } from "../linkedList/singlyLinkedList.js";
import { createCircularLinkedList } from "../linkedList/circularSinglyLinkedList.js";
import { createDoublyLinkedList } from "../linkedList/doublyLinkedList.js";
import { createCircularDoublyLinkedList } from "../linkedList/circularDoubleLinkedList.js";

// const singly = createSinglyLinkedList(1);
const doubly = createCircularDoublyLinkedList([1, 2, 3, 5, 6]);
doubly.prependNode(0);
// circularSingly.appendNode();
// const newImmutable = circularSingly.appendNode(2, true);
// newImmutable.removeLastNode(true);
// newImmutable.removeLastNode();
// doubly.removeFirstNode();
// doubly.removeFirstNode();

// doubly.positionBaseRemoval(2);
// doubly.forEach("head", (data) => {
//   console.log(data);
// });

// doubly.forEach("head", (data, _, breakTraversal) => {
//   console.log(data);
//   if (data === 2) {
//     breakTraversal();
//   }
// });

console.log(doubly.getNodeList());

// console.log(doubly.head);
