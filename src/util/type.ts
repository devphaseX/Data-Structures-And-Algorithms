export interface SortPredicateFn<T> {
  (itemOne: ListItemEntry<T>, itemTwo: ListItemEntry<T>): unknown;
}

export interface ListItemEntry<T> {
  item: T;
  position: number;
}
