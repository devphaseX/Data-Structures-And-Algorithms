import { Fun } from '../../util/type';

export type LinkType = 'single' | 'double';
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
  next: CircularDirectedNode<T>;
}
export interface DoubleCircularDirectedNode<T> {
  data: T;
  next: DoubleCircularDirectedNode<T>;
  prev: DoubleCircularDirectedNode<T>;
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
  size: number;
  appendNode(value: T | Array<T>): void;
  appendNode(value: T | Array<T>, mutable: true): Self;
  prependNode(value: T | Array<T>): void;
  prependNode(value: T | Array<T>, mutable: true): Self;
  reverse(mutable: true): Self;
  reverse(): void;
  removeNode(predicate: PredicateFn<T>): void;
  removeNode(predicate: PredicateFn<T>, mutable: true): Self;
  removeNodes(predicate: PredicateFn<T>): void;
  removeNodes(predicate: PredicateFn<T>, mutable: true): Self;
  emptyLinkedList(): void;
  emptyLinkedList(): Self;
  positionBaseRemoval(nodePosition: NodePosition): void;
  positionBaseRemoval(nodePosition: NodePosition, mutable: true): Self;
  positionsBaseRemoval(nodesPosition: Set<NodePosition>): void;
  positionsBaseRemoval(nodesPosition: Set<NodePosition>, mutable: true): Self;
  removeFirstNode(): void;
  removeFirstNode(mutable: true): Self;
  removeLastNode(): void;
  removeLastNode(mutable: true): Self;
  getNodeList(): Array<T>;
  getNodeData(position: number): T | null;
  getNodeData(predicate: PredicateFn<T>): T | null;
  [Symbol.iterator](): Generator<T>;
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
  forEach(traverseFn: LinkTraversalFn<T>, startPoint?: 'head' | 'tail'): void;
}

export interface CircularDoublyLinkedList<T>
  extends LinkedListMethods<
    T,
    DoubleCircularDirectedNode<T>,
    SinglyLinkedList<T>
  > {
  mapNode<U>(fn: (value: T) => U, mutable?: boolean): DoublyLinkedList<U>;
  forEach(traverseFn: LinkTraversalFn<T>, startPoint: 'head' | 'tail'): void;
}
export type PredicateFn<T> = (data: T, index: number) => unknown;

export type NodeReference<T> = DoubleReferenceNode<T> | SingleReferenceNode<T>;

export type DoublyNodeOption<T> = LinkedListInitial<T> & {
  type: 'double';
} & Omit<LinkOption, 'direction'>;
export type SinglyNodeOption<T> = LinkedListInitial<T> & {
  type: 'single';
} & Omit<LinkOption, 'direction'>;

export type NodeOption<T> = SinglyNodeOption<T> | DoublyNodeOption<T>;

export type LinkListType<T> =
  | SinglyLinkedList<T>
  | CircularLinkedList<T>
  | DoublyLinkedList<T>
  | CircularDoublyLinkedList<T>;

export interface LinkBoundary<Node> {
  root: Node;
  tail: Node;
  size: number;
}

export type LinkTraversalFn<T> = (
  value: T,
  position: number,
  stopTraverse: () => void
) => void;

export type LinkTraverseDirection = 'next' | 'prev';

export type LinkListEntry = 'head' | 'tail';

export type LinkOption = {
  direction: 'next' | 'prev';
  isCircular: boolean;
};

export type StateFulFnRecord = Record<
  string,
  { fn: Fun; validReturnStatus: boolean }
>;

export type GetLinkedListDataType<Link> = Link extends LinkListType<infer U>
  ? U
  : any;

export type LinkListMapperFn<Link> = (
  nodeValue: GetLinkedListDataType<Link>
) => GetLinkedListDataType<Link>;
