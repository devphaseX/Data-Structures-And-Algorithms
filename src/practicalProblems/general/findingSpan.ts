import { iterableLoop } from '../../util/index';

type Histogram = Array<number>;
type HistogramSpan = Array<number>;

function findingSpan(structure: Histogram) {
  const spans: HistogramSpan = Array(structure.length);
  iterableLoop<number>(structure, (currentPeek, peekPosition) => {
    let spanRange = 1;
    while (
      spanRange <= peekPosition &&
      currentPeek > structure[spanRange - peekPosition]
    )
      spanRange += 1;

    spans.push(spanRange);
  });

  return spans;
}
export default findingSpan;
