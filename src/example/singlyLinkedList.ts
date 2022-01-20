import { createCircularDoublyLinkedList } from '../linkedList/circularDoubleLinkedList.js';
import createStack from '../stack/index.js';

const doubly = createCircularDoublyLinkedList([1, 2, 3, 5, 6]);
doubly.prependNode(0);

// console.log(doubly.getNodeList());
// console.log(doubly.size);
// console.log(doubly);

// for (let item of doubly) {
//   console.log(item);
// }

// doubly.forEach((item) => {
//   console.log(item);
// }, 'tail');

// doubly.head?.next.next.next

const stack = createStack<number>(null, 3);
stack.push(1);
stack.push(2);
stack.push(3);

// console.log(stack.stackEntries());
stack.forEach((value) => {
  console.log(value);
});
