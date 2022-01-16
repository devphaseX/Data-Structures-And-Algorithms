export type LinkType = "single" | "double";
export type Node<T, IsDouble extends boolean = false> = IfElse<
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

export type SingleReferenceNode<T> =
  | SingleDirectedNode<T>
  | CircularDirectedNode<T>;

export type DoubleReferenceNode<T> =
  | DoubleDirectedNode<T>
  | DoubleCircularDirectedNode<T>;

export type CircularNode<T, IsDouble extends boolean = false> = IfElse<
  IsDouble,
  DoubleCircularDirectedNode<T>,
  CircularDirectedNode<T>
>;

type IfElse<Condition extends boolean, A, B> = Condition extends true ? A : B;

export interface LinkedListInitial<T> {
  initialData: T | Array<T>;
}

export type NodePosition = number;

export interface LinkedListMethods<T, Head, Self> {
  head: Head | null;
  appendNode(value: T | Array<T>): void;
  appendNode(value: T | Array<T>, mutable: true): Self;
  prependNode(value: T | Array<T>): void;
  prependNode(value: T | Array<T>, mutable: true): Self;
  removeNode(predicate: PredicateFn<T>): void;
  removeNode(predicate: PredicateFn<T>, mutable: true): Self;
  removeNodes(predicate: PredicateFn<T>): void;
  removeNodes(predicate: PredicateFn<T>, mutable: true): Self;
  positionBaseRemoval(nodePosition: NodePosition): void;
  positionBaseRemoval(nodePosition: NodePosition, mutable: true): Self;
  positionsBaseRemoval(nodesPosition: Set<NodePosition>): void;
  positionsBaseRemoval(nodesPosition: Set<NodePosition>, mutable: true): Self;
  removeFirstNode(): void;
  removeFirstNode(mutable: true): Self;
  removeLastNode(): void;
  removeLastNode(mutable: true): Self;
  getNodeList(): Array<T>;
}

export interface SinglyLinkedList<T>
  extends LinkedListMethods<T, SingleDirectedNode<T>, SinglyLinkedList<T>> {
  mapNode<U>(fn: (value: T) => U, mutable?: boolean): SinglyLinkedList<U>;
  forEach(traverseFn: LinkTraversalFn<T>): void;
}

export interface CircularLinkedList<T>
  extends LinkedListMethods<T, CircularDirectedNode<T>, CircularLinkedList<T>> {
  mapNode<U>(fn: (value: T) => U, mutable?: boolean): CircularLinkedList<U>;
  forEach(traverseFn: LinkTraversalFn<T>): void;
}
export interface DoublyLinkedList<T>
  extends LinkedListMethods<T, DoubleDirectedNode<T>, SinglyLinkedList<T>> {
  mapNode<U>(fn: (value: T) => U, mutable?: boolean): DoublyLinkedList<U>;
  forEach(startPoint: "head" | "tail", traverseFn: LinkTraversalFn<T>): void;
}

export interface CircularDoublyLinkedList<T>
  extends LinkedListMethods<
    T,
    DoubleCircularDirectedNode<T>,
    SinglyLinkedList<T>
  > {
  mapNode<U>(fn: (value: T) => U, mutable?: boolean): DoublyLinkedList<U>;
  forEach(startPoint: "head" | "tail", traverseFn: LinkTraversalFn<T>): void;
}
export type PredicateFn<T> = (data: T, index: number) => unknown;

export type NodeReference<T> = DoubleReferenceNode<T> | SingleReferenceNode<T>;

export type DoublyNodeOption<T> = LinkedListInitial<T> & {
  type: "double";
  isCircular: boolean;
};
export type SinglyNodeOption<T> = LinkedListInitial<T> & {
  type: "single";
  isCircular: boolean;
};

export type NodeOption<T> = SinglyNodeOption<T> | DoublyNodeOption<T>;

export type LinkListType<T> =
  | SinglyLinkedList<T>
  | CircularLinkedList<T>
  | DoublyLinkedList<T>
  | CircularDoublyLinkedList<T>;

export interface LinkBoundary<Node> {
  root: Node;
  tail: Node;
}

export type LinkTraversalFn<T> = (
  value: T,
  position: number,
  stopTraverse: () => void
) => void;
