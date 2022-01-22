import createHeap, { heapify } from '../data_structure/heap/heap.js';
import { createCircularDoublyLinkedList } from '../data_structure/linkedList/circularDoubleLinkedList.js';
import heapSort from '../sorting/heapSort.js';

const doubly = createCircularDoublyLinkedList([1, 2, 3, 5, 6]);
doubly.prependNode(0);
