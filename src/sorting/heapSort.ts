import createHeap, {
  Heap,
  HeapDataOrder,
} from '../data_structure/heap/heap.js';

function heapSort(strucrure: Heap): Array<number>;
function heapSort(list: Array<number>, order: HeapDataOrder): Array<number>;
function heapSort(value: Array<number> | Heap, order?: HeapDataOrder) {
  const heap = Array.isArray(value) ? createHeap(order ?? 'min', value) : value;
  return Array.from({ length: heap.size }, () => heap.delete());
}

export default heapSort;
