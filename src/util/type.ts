export interface SortPredicateFn<T> {
  (itemOne: ListItemEntry<T>, itemTwo: ListItemEntry<T>): unknown;
}

export interface ListItemEntry<T> {
  item: T;
  position: number;
}

export interface ValueFn<T> {
  (): Array<T>;
}

export interface Chain<T> {
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

export type Fun = (...value: any[]) => any;

export type ImmutablePreserverFn<F, R> = (fn: F, dependencies: any[]) => R;

export type GetAllFunctionValueKey<
  ActionableObject extends Record<PropertyKey, any>
> = {
  [Key in keyof ActionableObject]: ActionableObject[Key] extends Fun
    ? Key
    : never;
}[keyof ActionableObject];

export type DropFirst<L extends unknown[]> = L extends [
  __: any,
  ...rest: infer R
]
  ? R
  : [];

export type DropBound = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type DropNthFirstItem<
  L extends unknown[],
  Nth = DropBound,
  Count extends 0[] = []
> = Nth extends Count['length']
  ? L
  : DropNthFirstItem<DropFirst<L>, Nth, [...Count, 0]>;

export type SortPredicate<T> = (itemOne: T, itemTwo: T) => boolean;

export type InferMapValue<M> = M extends Map<any, infer V> ? V : unknown;

export type ListActionWithValue<T> = [list: Array<T>, item: T];
export type ListActionWithLength<T> = [list: Array<T>, length: number];
export type ListRequired<L extends unknown[]> = Array<
  NonNullable<InferMapValue<L>>
>;

export type InferArrayItem<A extends unknown[]> = A extends Array<infer I>
  ? I
  : unknown;

export type IntialDataFunction<T> = () => T;
