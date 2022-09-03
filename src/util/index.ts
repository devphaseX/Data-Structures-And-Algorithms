import {
  ListItemEntry,
  ValueFn,
  Chain,
  GetAllFunctionValueKey,
  ImmutablePreserverFn,
  ListActionWithValue,
  ListActionWithLength,
} from './type';

export function cloneObject<T extends Record<any, any>>(obj: T) {
  return { ...obj };
}

export function cloneList<T>(list: Array<T>) {
  return concat(list, []);
}

export function hasEmptyList(list: Array<any>) {
  return getListSize(list) === 0;
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

export function unwindProcess(reason?: any) {
  throw reason;
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

function workWithList<T>(list: Array<T>, workImmutably?: boolean) {
  return function <U>(useCopy: (cp: Array<T>) => U) {
    const copy = workImmutably ? cloneList(list) : list;
    return useCopy(copy);
  };
}

const push = function <T>(
  list: Array<T>,
  value: T,
  immutable?: boolean
): ListActionWithLength<T> {
  return workWithList(
    list,
    immutable
  )(function (newList) {
    return [newList, newList.push(value)];
  });
};

export const pop = function <T>(
  list: Array<T>,
  immutable?: boolean
): ListActionWithValue<T> {
  if (hasEmptyList(list)) {
    unwindProcess('Pop expected a List with item but got List with none');
  }
  return workWithList(
    list,
    immutable
  )(function (newList) {
    return [newList, newList.pop()!];
  });
};

const shift = function <T>(
  list: Array<T>,
  immutable?: boolean
): ListActionWithValue<T> {
  if (hasEmptyList(list)) {
    unwindProcess('Pop expected a List with item but got List with none');
  }
  return workWithList(
    list,
    immutable
  )(function (newList) {
    return [newList, newList.shift()!];
  });
};

const unshift = function <T>(
  list: Array<T>,
  value: T,
  immutable?: boolean
): ListActionWithLength<T> {
  return workWithList(
    list,
    immutable
  )(function (newList) {
    return [newList, newList.unshift(value)];
  });
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
  options: { offset: number; end?: number; mutable?: boolean }
) {
  const { offset, mutable, end } = options;

  return workWithList(
    list,
    mutable
  )(function (newList) {
    // newList.copyWithin(newList, offset, end);
    return newList;
  });
};

export const lastListItem = <T>(list: Array<T>) => {
  return list[getListSize(list) - 1];
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

export function insertItemAt<T>(source: Array<T>, item: T, offset: number) {
  if (!isWithinRange(0, getListSize(source), offset)) {
    throw RangeError(
      `Offset not within the Array data range, entered offset: ${offset}`
    );
  }

  splice(source, offset, 0, item);
  return source;
}

export function createItemEntry<T>(
  item: T,
  position: number
): ListItemEntry<T> {
  return { item, position };
}

interface LoopScopeFn {
  (currentIndex: number, nextIndex: number, exit: () => void): void;
}

export function rangeLoop(start: number, end: number, ranger: LoopScopeFn) {
  let isLoopBreak = false;

  function breakLoop() {
    isLoopBreak = true;
  }

  for (let i = start; i < end; i++) {
    ranger(i, i + 1, breakLoop);
    if (isLoopBreak) {
      return void 0;
    }
  }
}

export function unshiftLastItemWithFirst<T>(list: Array<T>) {
  switch (getListSize(list)) {
    case 0:
      throw new Error(`Unshifting of empty list isn't allow.`);

    case 1:
      return getListLastItem(list);

    default: {
      const [newList, lastItem] = pop(list, true);
      splice(newList, 0, 1, lastItem!);
      return getListFirstItem(newList);
    }
  }
}

export function getListFirstItem<T>(list: Array<T>) {
  return list[0];
}

export function getListLastItem<T>(list: Array<T>) {
  return 'at' in list ? list.at(-1) : list[getListSize(list) - 1];
}

export function getItemBoundary(range: { min: number; max: number }) {
  return range.max - range.min + 1;
}

export function getListBoundary(list: Array<number>) {
  return { min: Math.min.apply(null, list), max: Math.max.apply(null, list) };
}

export function _isPreSortedBySize<T>(list: Array<T>) {
  return [0, 1].includes(getListSize(list));
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

export function _ascendPredicate(itemOne: number, itemTwo: number) {
  return itemOne > itemTwo;
}

export function positionBasedComparer(fixed: number, item: number) {
  if (fixed === item) return 0;
  if (greaterThan.check(fixed, item)) return 1;
  return -1;
}

export function createArrayWithInitial<T>(size: number, _initialData: T) {
  return <Array<T>>Array(size).fill(_initialData);
}

export function createImmutableAction<Mutable extends Record<PropertyKey, any>>(
  mutables: Mutable,
  immutablePreserver: ImmutablePreserverFn<
    GetAllFunctionValueKey<Mutable>,
    Mutable
  >,
  whiteList?: Array<Mutable[keyof Mutable]>
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
        if (!isFunction(retrievedValue)) {
          return retrievedValue;
        } else {
          if (whiteList && whiteList.includes(retrievedValue)) {
            return retrievedValue;
          }
          return createImmutableWrapper(key as any);
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

export function isWithinRange(start: number, end: number, between: number) {
  return start <= between && between < end;
}

export function getListSize(list: Array<unknown>) {
  return list.length;
}

export function getLogarithmicPass(list: Array<any>) {
  return pipe(getListSize, Math.log2, Math.trunc)(list);
}

type SwapHistory<T> = { value: T; prev: number; cur: number };
export function swapListUsingPosition<T>(
  list: Array<T>,
  positionOne: number,
  positionTwo: number,
  immutable = false
): [Array<T>, { itemOne: SwapHistory<T>; itemTwo: SwapHistory<T> }] {
  function createSwapHistory(prev: number, cur: number): SwapHistory<T> {
    return {
      value: list[prev],
      prev,
      cur,
    };
  }

  return workWithList(
    list,
    immutable
  )(function (newList) {
    const itemOne = createSwapHistory(positionOne, positionTwo);
    const itemTwo = createSwapHistory(positionTwo, positionOne);

    newList[itemOne.prev] = itemTwo.value;
    newList[itemTwo.prev] = itemOne.value;
    return [newList, { itemOne, itemTwo }];
  });
}

type MappeableFn<S, T> = (value: S) => T;

export function pipe<A, B>(...fn: [f1: MappeableFn<A, B>]): MappeableFn<A, B>;
export function pipe<A, B, C>(
  ...fns: [f1: MappeableFn<A, B>, f2: MappeableFn<B, C>]
): MappeableFn<A, C>;
export function pipe<A, B, C, D>(
  ...fns: [f1: MappeableFn<A, B>, f2: MappeableFn<B, C>, f3: MappeableFn<C, D>]
): MappeableFn<A, D>;
export function pipe<A, B, C, D, E>(
  ...fns: [
    f1: MappeableFn<A, B>,
    f2: MappeableFn<B, C>,
    f3: MappeableFn<C, D>,
    f4: MappeableFn<D, E>
  ]
): MappeableFn<A, E>;
export function pipe<A, B, C, D, E, F>(
  ...fns: [
    f1: MappeableFn<A, B>,
    f2: MappeableFn<B, C>,
    f3: MappeableFn<C, D>,
    f4: MappeableFn<D, E>,
    f5: MappeableFn<E, F>
  ]
): MappeableFn<A, F>;

export function pipe<A, B, C, D, E, F>(
  ...fns: Array<MappeableFn<any, any>>
): any {
  return function (value: any) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}

type OrderFn = (a: number, b: number) => boolean;

type ComparisonTask = {
  lessThan: [
    OrderFn,
    Array<Exclude<keyof ComparisonTask, 'greaterThan' | 'lessThan'>>
  ];
  greaterThan: [
    OrderFn,
    Array<Exclude<keyof ComparisonTask, 'greaterThan' | 'lessThan'>>
  ];
  equal: [
    (a: any, b: any) => boolean,
    Array<
      Exclude<keyof ComparisonTask, 'greaterThan' | 'lessThan' | 'notEqual'>
    >
  ];
  notEqual: [
    (a: any, b: any) => boolean,
    Array<Exclude<keyof ComparisonTask, 'greaterThan' | 'lessThan' | 'equal'>>
  ];
};

type ComparisonOperator = {
  [K in keyof ComparisonTask]: Pick<
    ComparisonOperator,
    ComparisonTask[K][1][number]
  > & {
    check(a: any, b: any): boolean;
  };
};

export const compare = (() => {
  const comparisonTask: ComparisonTask = {
    lessThan: [lessThan, ['equal', 'notEqual']],
    greaterThan: [greaterThan, ['equal', 'notEqual']],
    equal: [equal, []],
    notEqual: [notEqual, []],
  };

  function lessThan(a: number, b: number) {
    return a < b;
  }

  function greaterThan(a: number, b: number) {
    return a > b;
  }

  function equal(a: any, b: any) {
    if ('is' in Object) return Object.is(a, b);
    return (function (a: any, b: any) {
      if (typeof a === 'number' && typeof b === 'number') {
        return a === b || (a !== a && b !== b);
      }
      return a === b;
    })(a, b);
  }

  function notEqual(a: any, b: any) {
    return !equal(a, b);
  }

  function acknowledgeTasks(tasks: Array<OrderFn>) {
    return function check(a: any, b: any) {
      return tasks.some(callLaterWith(null, [a, b]));
    };
  }

  function restrictAccess(
    currentTasks: Array<OrderFn>,
    lastAccesKey: keyof ComparisonTask
  ): any {
    const nextMethodKeys = comparisonTask[lastAccesKey][1] as Array<
      keyof ComparisonTask
    >;

    const handler = {
      get(_: any, key: any) {
        if (typeof key === 'string' && key === 'check') {
          return acknowledgeTasks(currentTasks);
        }

        if (nextMethodKeys.includes(key)) {
          const opK = key as keyof ComparisonTask;
          return restrictAccess([...currentTasks, comparisonTask[opK][0]], opK);
        }

        unwindProcess(
          `The comparison operator accessed doesn't exist, expected ${Object.keys(
            nextMethodKeys
          ).join(',')} but got ${key}`
        );
      },
    };
    return new Proxy({}, handler);
  }

  return new Proxy({} as ComparisonOperator, {
    get(_, key) {
      if (key === 'check') {
        throw new TypeError();
      }

      if (key in comparisonTask) {
        let accessKey = key as keyof ComparisonTask;
        return restrictAccess([comparisonTask[accessKey][0]], accessKey);
      }
    },
  });
})();

export const { lessThan, equal, greaterThan, notEqual } = compare;

export function isNotEmpty(value: any) {
  return (
    value != null ||
    (typeof value === 'string' && value.trim() !== '') ||
    (typeof value === 'number' && (value === 0 || value !== value))
  );
}

export function unwrapIterable<T>(iterable: Iterable<T>) {
  return [...iterable];
}

export function unary<T, U>(fn: (value: T) => U) {
  return function narrowDown(value: T) {
    return fn(value);
  };
}

export function binary<A, B, C>(fn: (a: A, b: B) => C) {
  return function narrowDown(a: A, b: B) {
    return fn(a, b);
  };
}

export function callLaterWith<C, R extends unknown[], V>(context: C, args: R) {
  return function invokeWithConstants(fn: (...args: R) => V) {
    return fn.apply(context, args);
  };
}

export function normalizeListableArgs<T>(arg: T | Array<T>) {
  return [arg].flat(1) as Array<T>;
}

export function isEven(value: number) {
  return value % 2 === 0;
}

export function identity<T>(value: T) {
  return value;
}

export function isOdd(value: number) {
  return !isEven(value);
}

export interface Success<T> {
  type: 'success';
  value: T;
}

export interface Failure<E> {
  type: 'failed';
  error: { cause: E };
}

export type Option<Result, Error> = Success<Result> | Failure<Error>;

type OptionResult<V, IsError extends boolean> = IsError extends true
  ? Success<V>
  : Failure<V>;

export function createOption<V, IsError extends boolean>(
  value: V,
  errorType: IsError
): OptionResult<V, IsError> {
  if (errorType === true)
    return { type: 'failed', error: { cause: value } } as OptionResult<
      V,
      IsError
    >;
  return { type: 'success', value } as OptionResult<V, IsError>;
}

export interface Some<T> {
  type: 'some';
  value: T;
}

export interface None {
  type: 'none';
}

export type Result<Value> = Some<Value> | None;

export function createValueWrapper(computer: () => null | undefined): None;
export function createValueWrapper<V>(computer: () => V): Some<V>;
export function createValueWrapper<V>(
  computer: () => V | null | undefined
): Result<V> {
  const result = computer();
  if (result === null || result === undefined) {
    return { type: 'none' };
  }
  return { type: 'some', value: result };
}

export function containValueInList<T>(value: T | T[]): T[] {
  return [value].flat(1) as T[];
}

export function double(value: number) {
  return value * 2;
}

function supportIterator<T>(value: any): value is Iterable<T> {
  return Symbol.iterator in value;
}
export function iterableLoop<T>(
  iterable: any,
  cb: (
    value: T,
    index: number,
    option: { iterable: Iterable<T>; breakLoop: () => void }
  ) => void
) {
  if (!supportIterator<T>(iterable)) {
    throw new TypeError('Structure cannot be iterable.');
  }

  let index = 0;
  let breakLoop = false;
  function setBreakState() {
    breakLoop = true;
  }
  for (let item of iterable) {
    cb(item, index++, { iterable, breakLoop: setBreakState });
    if (breakLoop) break;
  }
}

type EmptyStructureFn<Struct, Value> = (oldStructure: Struct) => {
  structure: Struct;
  push: (value: Value) => void;
  checkExist: (value: Value) => boolean;
};

export function createUniqueStructure<Value, Struct extends Iterable<Value>>(
  structure: Struct,
  createEmptyStructure: EmptyStructureFn<Struct, Value>
) {
  const {
    structure: uniqueStructure,
    push,
    checkExist,
  } = createEmptyStructure(structure);
  iterableLoop<Value>(structure, (item) => {
    if (checkExist(item)) return;
    push(item);
  });

  return uniqueStructure;
}

export function escapeRegExp(tokens: string) {
  return tokens.replace(/[.^\\/(){}*+?]/g, '\\$&');
}

export const DIGIT_PATTERN = /\d+\.?\d*?/;

export function isDigit(value: string) {
  return DIGIT_PATTERN.test(value);
}
