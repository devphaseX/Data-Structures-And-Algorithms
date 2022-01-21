import { createCircularDoublyLinkedList } from '../data_structure/linkedList/circularDoubleLinkedList.js';
import createStack from '../data_structure/stack/index.js';
import sortByBubble from '../sorting/bubble.js';
import quickSort from '../sorting/quick.js';

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

const list = sortByBubble([-2, 6, 0, 4, 5, 1, -1, 2], (x, y) => {
  return x.item > y.item;
});

console.log(list);

console.log(quickSort([-2, 6, 0, 4, 5, 1, -1, 2]));
console.log(quickSort([10, 15, 1, 2, 9, 16, 11]));
