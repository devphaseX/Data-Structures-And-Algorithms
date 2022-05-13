import {
  flatList,
  getFloatingPoint,
  getMaxNumber,
  getMinNumber,
  greaterThan,
  rangeLoop,
  toFixed,
  lessThan,
} from '../util/index.js';

type Floatable = { int: string; fraction: string; normalForm: number };
type FloatableInt<T = string> = {
  value: T;
  revertToFloat(): number;
  fixedPoint: number;
};
type BucketStructure = Map<number, Array<FloatableInt>>;

type NegativeNormalise = {
  revertNegativity(value: number, fixedPoint: number): number;
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
  list = list.map(castToPositive);

  function castToPositive(v: number) {
    return v + Math.abs(min);
  }

  function normalize(value: number, fixedPoint = 0) {
    const originalForm = value + min;
    return greaterThan.check(fixedPoint, 0)
      ? toFixed(originalForm, fixedPoint)
      : originalForm;
  }

  function passThrough(value: number) {
    return value;
  }
  return {
    revertNegativity: lessThan.check(min, 0) ? normalize : passThrough,
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

  function normalizeUnit(item: FloatableInt<number>) {
    return {
      ...item,
      value: item.value.toString().padStart(unit, '0'),
    };
  }

  const floatableValues = floatForms.map(convertFloatToInt);
  const unit = maxInt.toString().length + decimalRange;
  return {
    unit,
    norminalUnits: floatableValues.map(normalizeUnit),
  };
}

export default function sortUsingRadix(list: Array<number>) {
  const { revertNegativity, negativeNormalisedList } =
    normalizeNegativeValues(list);
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
    revertNegativity(revertToFloat(), fixedPoint)
  );
}
