import {
  ListItemEntry,
  ValueFn,
  Chain,
  GetAllFunctionValueKey,
  ImmutablePreserverFn,
} from './type';

export function cloneObject<T extends Record<any, any>>(obj: T) {
  return { ...obj };
}

export function cloneList<T>(list: Array<T>) {
  return concat(list, []);
}
export function sealObject<T extends Record<any, any>>(obj: T) {
  return Object.seal(obj);
}

export function isPropertyOwn(value: any, key: PropertyKey) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

export function normaliseAccessorProps<T extends Record<any, any>>(obj: T) {
  for (let key in obj) {
    if (isPropertyOwn(obj, key)) {
      const propertyDescriptor = Object.getOwnPropertyDescriptor(obj, key);
      if (propertyDescriptor?.set && !propertyDescriptor.get) continue;

      if (propertyDescriptor && propertyDescriptor.get) {
        Object.defineProperty(obj, key, {
          writable: true,
          value: obj[key],
        });
      }
    }
  }
  return obj;
}

export function unwindProcess() {
  throw void 0;
}

export function _chain<T>(value: Array<T>) {
  const listOperationFns = [
    map,
    filter,
    fill,
    concat,
    reverse,
    push,
    sort,
    pop,
    slice,
    splice,
    shift,
    unshift,
    copyWithin,
  ] as const;

  function _chainInvoker<T>(valueFn: ValueFn<T>): Chain<T> {
    return Object.fromEntries([
      ...listOperationFns.map((fn) => [
        fn.name,
        function (
          ...args: Parameters<typeof fn>
        ): Chain<ReturnType<typeof fn>> {
          return _chainInvoker(() => {
            return (fn as any)(valueFn(), ...args);
          });
        },
      ]),

      [
        'value',
        function () {
          return valueFn() as any;
        },
      ],
    ]);
  }
  return _chainInvoker(() => value);
}

const nativeArrayPrototype = Array.prototype;

export function map<T, U>(list: Array<T>, fn: (value: T, index: number) => U) {
  return nativeArrayPrototype.map.call(list, fn);
}

function filter<T>(
  list: Array<T>,
  predicate: (value: T, index: number) => unknown
): Array<T>;
function filter<T, U extends T>(
  list: Array<T>,
  predicate: (value: T, index: number) => U
): Array<U>;

function filter<T>(
  list: Array<T>,
  predicate: (value: T, index: number) => any
) {
  return nativeArrayPrototype.filter.call(list, predicate);
}

const concat = function <T>(list: Array<T>, extendsList: Array<T>): Array<T> {
  return nativeArrayPrototype.concat.call(list, extendsList);
};

export const flatList = function <T>(
  nestedStructure: Array<any>,
  dept = Infinity
): Array<T> {
  return nativeArrayPrototype.flat.call(nestedStructure, dept) as Array<T>;
};

const sort = function <T>(
  list: Array<T>,
  comparator: (f: T, s: T) => number
): Array<T> {
  return nativeArrayPrototype.sort.call(list, comparator);
};

const reverse = function <T>(list: Array<T>): Array<T> {
  return nativeArrayPrototype.reverse.call(concat(list, []));
};

const fill = function <T>(
  list: Array<T>,
  value: T,
  offset: number,
  end?: number
) {
  return nativeArrayPrototype.fill.call(list, value, offset, end);
};

const push = function <T>(list: Array<T>, value: T) {
  const newList = concat(list, []);
  return newList.push(value), newList;
};

const pop = function <T>(list: Array<T>) {
  const newList = concat(list, []);
  return newList.pop(), newList;
};

const shift = function <T>(list: Array<T>): Array<T> {
  const newList = concat(list, []);
  return newList.shift(), newList;
};

const unshift = function <T>(list: Array<T>, value: T): Array<T> {
  const newList = concat(list, []);
  return newList.unshift(value), newList;
};

export const slice = function <T>(
  list: Array<T>,
  start: number,
  end?: number
): Array<T> {
  return nativeArrayPrototype.slice.call(list, start, end);
};

export const splice = function <T>(
  list: Array<T>,
  start: number,
  length: number,
  ...placement: Array<T>
): Array<T> {
  return nativeArrayPrototype.splice.call(list, start, length, ...placement);
};

const copyWithin = function <T>(
  list: Array<T>,
  target: number,
  offset: number,
  end?: number
) {
  const newList = concat(list, []);
  return newList.copyWithin(target, offset, end);
};

export const lastListItem = <T>(list: Array<T>) => {
  return list[list.length - 1];
};
export function swapItem<T>(
  source: Array<T>,
  itemOne: ListItemEntry<T>,
  itemTwo: ListItemEntry<T>
) {
  const { item: itemOneData, position: itemOnePosition } = itemOne;
  const { item: itemTwoData, position: itemTwoPosition } = itemTwo;
  source.splice(itemOnePosition, 1, itemTwoData);
  source.splice(itemTwoPosition, 1, itemOneData);
  return source;
}

export function createItemEntry<T>(
  item: T,
  position: number
): ListItemEntry<T> {
  return { item, position };
}

export function rangeLoop(
  start: number,
  end: number,
  ranger: (i: number, j: number, breakLoop: () => void) => void
) {
  let isLoopBreak = false;

  function breakLoop() {
    isLoopBreak = true;
  }

  loop: for (let i = start; i < end; i++) {
    ranger(i, i + 1, breakLoop);
    if (isLoopBreak) {
      break loop;
    }
  }
}

export function unshiftLastItemWithFirst<T>(list: Array<T>) {
  return list.splice(0, 1, list.pop()!)[0];
}

export function getItemBoundary(range: { min: number; max: number }) {
  return range.max - range.min + 1;
}

export function getListBoundary(list: Array<number>) {
  return { min: Math.min.apply(null, list), max: Math.max.apply(null, list) };
}

export function _isPreSortedBySize<T>(list: Array<T>) {
  return [0, 1].includes(list.length);
}

export function getMiddlePoint(lb: number, ub: number) {
  return Math.trunc((lb + ub) / 2);
}

/**
 *If dataone is greater than dateTwo the value 1 get returned which denote that
 *the first value is ahead of the second, while -1 denote behind
 */
export function _defaultSort(dataOne: number, dataTwo: number) {
  return dataOne > dataTwo ? 1 : -1;
}

export function _handleNumericSortBasedPredicate(
  condition: number | boolean,
  order: 'ascend' | 'descend'
) {
  if (typeof condition === 'boolean') {
    return condition;
  }
  switch (order) {
    case 'ascend': {
      return condition < 0 ? true : false;
    }
    case 'descend': {
      return condition > 0 ? false : true;
    }

    default:
      return true;
  }
}

export function _ascendPredicate<T>(
  itemOne: ListItemEntry<T>,
  itemTwo: ListItemEntry<T>
) {
  return itemOne.item > itemTwo.item;
}

export function createArrayWithInitial<T>(size: number, _initialData: T) {
  return <Array<T>>Array(size).fill(_initialData);
}

export function createImmutableAction<Mutable extends Record<PropertyKey, any>>(
  mutables: Mutable,
  immutablePreserver: ImmutablePreserverFn<
    GetAllFunctionValueKey<Mutable>,
    Mutable
  >
) {
  function removeImmutableIndicator(deps: any[]) {
    return slice(deps, 0, -1);
  }

  function isImmutableAllowed(dependencies: any[]) {
    let immutableSigner = lastListItem(dependencies);
    return isBoolean(immutableSigner) && immutableSigner;
  }

  function createImmutableWrapper<
    FunKey extends GetAllFunctionValueKey<Mutable>
  >(key: FunKey) {
    return function (...dependencies: any[]) {
      if (isImmutableAllowed(dependencies)) {
        return immutablePreserver(key, removeImmutableIndicator(dependencies));
      } else {
        return mutables[key](...dependencies);
      }
    };
  }

  return new Proxy(mutables, {
    get(target, key, receiver) {
      if (Reflect.has(target, key)) {
        const retrievedValue = Reflect.get(target, key, receiver);
        if (isFunction(retrievedValue)) {
          return createImmutableWrapper(key as any);
        } else {
          return retrievedValue;
        }
      } else {
        return void 0;
      }
    },
  });
}

export function isFunction(value: any) {
  return typeof value === 'function';
}

export function isBoolean(value: any) {
  return typeof value === 'boolean';
}

const floatPattern = /(\d+)?\.(\d+)/;

export function getFloatingPoint(value: number) {
  const floatMatch = value.toString().match(floatPattern);
  return floatMatch
    ? { int: floatMatch[1], fraction: floatMatch[2], normalForm: value }
    : { int: value.toString(), fraction: '', normalForm: value };
}

export function getMaxNumber(list: Array<number>) {
  return Math.max.apply(null, list);
}

export function getMinNumber(list: Array<number>) {
  return Math.min.apply(null, list);
}

export function toFixed(value: number, extend: number) {
  return +value.toFixed(extend);
}
