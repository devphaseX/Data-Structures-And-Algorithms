import { createCircularDoublyLinkedList } from '../linkedList/circularDoubleLinkedList.js';

const doubly = createCircularDoublyLinkedList([1, 2, 3, 5, 6]);
doubly.prependNode(0);

console.log(doubly.getNodeList());
console.log(doubly.size);
console.log(doubly);

for (let item of doubly) {
  console.log(item);
}
