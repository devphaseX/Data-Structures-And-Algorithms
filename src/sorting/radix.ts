import { flatList, rangeLoop } from '../util/index.js';

type BucketStructure = Map<number, Array<string>>;

function createBucketStructure(base: number) {
  const bucketBase: BucketStructure = new Map();
  rangeLoop(0, base, (i) => {
    bucketBase.set(i, []);
  });
  return bucketBase;
}

function flattenBucketStructure(structure: BucketStructure) {
  return flatList<string>(Array.from(structure.values()));
}

function getNumberPlacementUnit(value: number) {
  return value.toString().length;
}

function getPhaseValueAt(value: string, unit: number) {
  return value.toString()[unit];
}

function normalizeValueToUnit(value: Array<number>, unit: number) {
  function normalizeUnit(item: number) {
    return item.toString().padStart(unit, '0');
  }
  return value.map(normalizeUnit);
}

export default function sortUsingRadix(list: Array<number>) {
  let placeUnitSize = getNumberPlacementUnit(Math.max.apply(null, list));
  let stringifiedNumbers = normalizeValueToUnit(list, placeUnitSize);

  rangeLoop(0, placeUnitSize, (forwardUnitPosition) => {
    const radixBucket = createBucketStructure(10);
    const backwardUnitPosition = placeUnitSize - forwardUnitPosition - 1;

    rangeLoop(0, list.length, (valueIndex) => {
      const currentValue = stringifiedNumbers[valueIndex];
      const currentPhaseValue = getPhaseValueAt(
        currentValue,
        backwardUnitPosition
      );

      radixBucket.get(+currentPhaseValue)!.push(currentValue);
    });
    stringifiedNumbers = flattenBucketStructure(radixBucket);
  });

  return stringifiedNumbers.map(Number);
}
