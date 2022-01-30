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
