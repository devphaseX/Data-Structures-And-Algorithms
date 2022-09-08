import createStack from '../../data_structure/stack/index.js';
import { iterableLoop } from '../../util/index.js';

type Histogram = Array<number>;
type HistogramSpan = Array<number>;

function findingSpan(structure: Histogram) {
  const spanStack = createStack<number>(null);
  const diagramSpan: HistogramSpan = Array(structure.length);

  iterableLoop<number>(structure, (currentPeek, i) => {
    while (!spanStack.isEmpty() && currentPeek > structure[spanStack.peek()!]) {
      spanStack.pop();
    }

    let p = -1;
    if (!spanStack.isEmpty()) p = spanStack.peek()!;
    diagramSpan.push(i - p);
    spanStack.push(i);
  });

  return diagramSpan;
}

export default findingSpan;
