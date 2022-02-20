import { Heap, HeapDataOrder } from '../data_structure/heap/heap.js';
import createHeap from '../data_structure/heap/index.js';
import { _isPreSortedBySize, slice } from '../util/index.js';

function heapSort(strucrure: Heap): Array<number>;
function heapSort(list: Array<number>, order: HeapDataOrder): Array<number>;
function heapSort(value: Array<number> | Heap, order?: HeapDataOrder) {
  if (Array.isArray(value) && _isPreSortedBySize(value)) {
    return slice(value, 0);
  }
  const heap = Array.isArray(value) ? createHeap(order ?? 'min', value) : value;
  return Array.from({ length: heap.size }, () => heap.delete());
}

export default heapSort;