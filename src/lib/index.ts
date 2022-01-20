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

interface ListItemEntry<T> {
  item: T;
  position: number;
}

export function createItemEntry<T>(
  item: T,
  position: number
): ListItemEntry<T> {
  return { item, position };
}
