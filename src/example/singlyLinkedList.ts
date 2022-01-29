import { heapify } from '../data_structure/heap/heap.js';
import createHeap from '../data_structure/heap/index.js';
import { createCircularDoublyLinkedList } from '../data_structure/linkedList/circularDoubleLinkedList.js';
import sortByBubble from '../sorting/bubble.js';
import countSort from '../sorting/count.js';
import heapSort from '../sorting/heapSort.js';
import mergeSort from '../sorting/merge.js';
import { _defaultSort } from '../util/index.js';

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

// const stack = createStack<number>(null, 3);
// stack.push(1);
// stack.push(2);
// stack.push(3);

// // console.log(stack.stackEntries());
// stack.forEach((value) => {
//   console.log(value);
// });

// const list = sortByBubble([16, 14, 5, 6, 8], (x, y) => {
//   return x.item > y.item;
// });

// console.log(list);

// console.log(quickSort([-2, 6, 0, 4, 5, 1, -1, 2]));
console.log(heapSort([6, 5, 1, 4, -2, 0, -1, 2], 'min'));

/* 
                  10
          15               1
      2      9         16      11
*/

const heap = createHeap('max', [6, 5, 1, 4, -2, 0, -1, 2]);

// [-2, 6, 0, 4, 5, 1, -1, 2].forEach((data) => {
//   heap.insert(data);
// });
// console.log(heap.sort('min'));

console.log(heapify([-2, 6, 0, 4, 5, 1, -1, 2], 'max'));

/* 
                -2
      6                      0
  4       5             1        -1

2

*/

//[6, 5, 1, 4, -2, 0, -1, 2]

console.log('count', countSort([-2, 6, 0, 4, 5, 1, -1, 2]));
console.log(mergeSort([-2, 6, 0, 4, 5, 1, -1, 2]));
console.log(sortByBubble([-2, 6, 0, 4, 5, 1, -1, 2]));
