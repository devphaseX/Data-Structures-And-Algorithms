import {
  flatList,
  getFloatingPoint,
  getMaxNumber,
  getMinNumber,
  rangeLoop,
} from '../util/index.js';

type Floatable = { int: string; fraction: string; normalForm: number };
type FloatableInt<T = string> = {
  value: T;
  revertToFloat(): number;
  fixedPoint: number;
};
type BucketStructure = Map<number, Array<FloatableInt>>;

type NegativeNormalise = {
  revert(value: number, fixedPoint: number): number;
  negativeNormalisedList: Array<number>;
};

type UnitNormalise = {
  unit: number;
  norminalUnits: Array<FloatableInt>;
};

function createBucketStructure(base: number) {
  const bucketBase: BucketStructure = new Map();
  rangeLoop(0, base, (i) => {
    bucketBase.set(i, []);
  });
  return bucketBase;
}

function normalizeNegativeValues(list: Array<number>): NegativeNormalise {
  const min = getMinNumber(list);
  list = list.map((v) => v + Math.abs(min));
  function normalize(value: number, fixedPoint = 0) {
    const originalForm = value + min;
    return fixedPoint > 0 ? +originalForm.toFixed(fixedPoint) : originalForm;
  }

  function passThrough(value: number, fixedPoint = 0) {
    return value;
  }
  return {
    revert: min < 0 ? normalize : passThrough,
    negativeNormalisedList: list,
  };
}

function flattenBucketStructure<T>(structure: BucketStructure) {
  return flatList<T>(Array.from(structure.values()));
}

function getPhaseValueAt(value: string, unit: number) {
  return value.toString()[unit];
}

function normalizeValueToUnit(value: Array<number>): UnitNormalise {
  const floatForms = value.map(getFloatingPoint);
  const maxFraction = getMaxFraction(floatForms);
  const maxInt = getMaxInt(floatForms);
  const decimalRange = maxFraction.toString().length;

  function getMaxFraction(value: Array<Floatable>) {
    const fractions = value.map(({ fraction }) => {
      return +fraction;
    });

    return getMaxNumber(fractions);
  }

  function getMaxInt(value: Array<Floatable>) {
    const ints = value.map(({ int }) => +int);
    return getMaxNumber(ints);
  }

  function convertFloatToInt(floatable: Floatable) {
    function revert() {
      return floatable.normalForm;
    }

    const intForm = floatable.normalForm * 10 ** decimalRange;
    return {
      value: intForm,
      revertToFloat: revert,
      fixedPoint: floatable.fraction.length,
    };
  }
  function normalizeUnit(item: FloatableInt<number>, limit: number) {
    return {
      ...item,
      value: item.value.toString().padStart(limit, '0'),
    };
  }

  const floatableValues = floatForms.map(convertFloatToInt);

  const unit = maxInt.toString().length + decimalRange;
  return {
    unit,
    norminalUnits: floatableValues.map((v) => normalizeUnit(v, unit)),
  };
}

export default function sortUsingRadix(list: Array<number>) {
  const { revert, negativeNormalisedList } = normalizeNegativeValues(list);

  let { norminalUnits, unit } = normalizeValueToUnit(negativeNormalisedList);

  rangeLoop(0, unit, (forwardUnitPosition) => {
    const radixBucket = createBucketStructure(10);
    const backwardUnitPosition = unit - forwardUnitPosition - 1;

    rangeLoop(0, list.length, (valueIndex) => {
      const normalizedUnit = norminalUnits[valueIndex];
      const currentPhaseValue = getPhaseValueAt(
        normalizedUnit.value,
        backwardUnitPosition
      );

      radixBucket.get(+currentPhaseValue)!.push(normalizedUnit);
    });
    norminalUnits = flattenBucketStructure(radixBucket);
  });

  return norminalUnits.map(({ revertToFloat, fixedPoint }) =>
    revert(revertToFloat(), fixedPoint)
  );
}
