import { ListItemEntry } from './type';

export function cloneObject<T extends Record<any, any>>(obj: T) {
  return { ...obj };
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
      if (propertyDescriptor?.set && !propertyDescriptor.get) {
        continue;
      }

      Object.defineProperty(obj, key, {
        enumerable: propertyDescriptor?.enumerable,
        configurable: propertyDescriptor?.configurable,
        writable: true,
        value: obj[key],
      });
    }
  }
  return obj;
}

export function unwindProcess() {
  throw void 0;
}

interface ValueFn<T> {
  (): Array<T>;
}

interface Chain<T> {
  map<U>(fn: (value: T, index: number) => U): Chain<U>;
  filter(predicate: (value: T) => unknown): Chain<T>;
  filter<U extends T>(predicate: (value: T) => value is U): Chain<U>;
  slice(start: number, end: number): Chain<T>;
  splice(start: number, length: number, ...placement: Array<T>): Chain<T>;
  push(value: T): Chain<T>;
  pop(): Chain<T>;
  unshift(value: T): Chain<T>;
  shift(): Chain<T>;
  copyWithin(target: number, start: number, end?: number): Chain<T>;
  fill(target: number, start: number, end?: number): Chain<T>;
  reverse(): Chain<T>;
  sort(comparator: (first: T, second: T) => number | boolean): Chain<T>;
  value: () => Array<T>;
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

const splice = function <T>(
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
