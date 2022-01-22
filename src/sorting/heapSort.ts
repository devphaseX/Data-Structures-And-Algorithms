import createHeap from '../data_structure/heap/heap.js';

function heapSort(list: Array<number>, order: 0 | 1) {
  const _heap = createHeap(order === 0 ? 'max' : 'min');
  list.forEach((item) => {
    _heap.insert(item);
  });

  return list.map((_) => _heap.delete(0));
}

export default heapSort;

/* [-1, 1, 2, 10, 15, 9, 16, 11]
              -1
        1              2
    10     15        9   16
11

*/
