export type Node<
  T,
  IsDouble extends boolean = false
> = IfElse<
  IsDouble,
  DoubleDirectedNode<T>,
  SingleDirectedNode<T>
>;

export interface SingleDirectedNode<T> {
  data: T;
  next: SingleDirectedNode<T> | null;
}

export interface DoubleDirectedNode<T> {
  data: T;
  next: DoubleDirectedNode<T> | null;
  prev: DoubleDirectedNode<T> | null;
}

export interface CircularDirectedNode<T> {
  data: T;
  next: CircularDirectedNode<T> | null;
}
export interface DoubleCircularDirectedNode<T> {
  data: T;
  next: DoubleCircularDirectedNode<T> | null;
  prev: DoubleCircularDirectedNode<T> | null;
}

export type CircularNode<
  T,
  IsDouble extends boolean = false
> = IfElse<
  IsDouble,
  DoubleCircularDirectedNode<T>,
  CircularDirectedNode<T>
>;

type IfElse<
  Condition extends boolean,
  A,
  B
> = Condition extends true ? A : B;
