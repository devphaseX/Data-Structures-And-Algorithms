import { sealObject } from "../util/index.js";
import { createNode, createNodes, tranverseNode } from "./index.js";
import { SingleDirectedNode } from "./type.js";

interface LinkedListInitial<T> {
  initialData?: T | Array<T>;
}

type NodePosition = number;

interface SinglyLinkedList<T> {
  head: SingleDirectedNode<T>;
  appendNode(value: T): void;
  appendNode(value: T, mutable: true): SinglyLinkedList<T>;
  prependNode(value: T): void;
  prependNode(value: T, mutable: true): SinglyLinkedList<T>;
  map<U>(fn: (value: T) => U, mutable?: boolean): SinglyLinkedList<U>;
  removeNode(predicate: PredicateFn<T>): void;
  removeNode(predicate: PredicateFn<T>, mutable: true): SinglyLinkedList<T>;
  removeNodes(predicate: PredicateFn<T>): void;
  removeNodes(predicate: PredicateFn<T>, mutable: true): SinglyLinkedList<T>;
  positionBaseRemoval(nodePosition: NodePosition): void;
  positionBaseRemoval(
    nodePosition: NodePosition,
    mutable: true
  ): SinglyLinkedList<T>;
  positionsBaseRemoval(nodesPosition: Set<NodePosition>): void;
  positionsBaseRemoval(
    nodesPosition: Set<NodePosition>,
    mutable: true
  ): SinglyLinkedList<T>;
  removeFirstNode(): SinglyLinkedList<T>;
  removeFirstNode(mutable: true): SinglyLinkedList<T>;
  removeLastNode(): SinglyLinkedList<T>;
  removeLastNode(mutable: true): SinglyLinkedList<T>;
}

type PredicateFn<T> = (data: T, index: number) => unknown;

export function createSinglyLinkedList<T>(
  linkConfig?: LinkedListInitial<T>
): SinglyLinkedList<T> {
  let head: SingleDirectedNode<T> | null = linkConfig
    ? Array.isArray(linkConfig.initialData)
      ? createNodes(linkConfig.initialData)
      : linkConfig.initialData
      ? createNode(linkConfig.initialData)
      : null
    : null;

  function derefNode(
    predicate: PredicateFn<T>,
    curPosition?: number,
    stopOnFirstOccurence?: boolean
  ): void {
    if (!head) {
      return;
    }

    if (predicate(head.data, curPosition ?? 1)) {
      if (!head.next) {
        head = null;
      } else {
        head = head.next;
      }
      if (stopOnFirstOccurence) {
        return void 0;
      } else {
        return void (head && derefNode(predicate, (curPosition ?? 1) + 1));
      }
    }

    if (head) {
      let beforeNode = head;
      tranverseNode(
        head,
        (curNode, position, abortTraverse) => {
          if (predicate(curNode.data, position)) {
            beforeNode.next = curNode.next;
            if (stopOnFirstOccurence) {
              return abortTraverse();
            }
          }
          beforeNode = curNode;
        },
        curPosition
      );
    }
  }

  function appendNode(data: T) {
    if (!head) {
      head = createNode(data);
    } else {
      let lastNode!: SingleDirectedNode<T>;
      tranverseNode(head, (curNode) => {
        if (!curNode.next) {
          lastNode = curNode;
        }
      });

      lastNode.next = createNode(data);
    }
  }

  const prependNode = function (data: T) {
    if (!head) {
      return void (head = createNode(data));
    }
    const newHead = createNode(data);
    newHead.next = head;
    head = newHead;
  };

  const removeNode = function (predicate: PredicateFn<T>): void {
    return void derefNode(predicate, 1, true);
  };

  const removeNodes = function (predicate: PredicateFn<T>): void {
    return void derefNode(predicate);
  };

  function map<U>(mapFn: (value: T) => U) {
    const newLinks = createSinglyLinkedList<U>();
    if (head) {
      tranverseNode(head, (curNode) => {
        newLinks.appendNode(mapFn(curNode.data));
      });
    }
    return newLinks;
  }

  function positionBaseRemoval(selectPosition: number) {
    return removeNode(function (_, nodePosition) {
      return nodePosition === selectPosition;
    });
  }

  function adjustNodePosition(
    nodePosition: Set<NodePosition>,
    curPositon: NodePosition
  ) {
    let newNodePosition = new Set(nodePosition);
    if (nodePosition.has(curPositon)) {
      newNodePosition.delete(curPositon);
      const nodesListPosition = Array.from(newNodePosition, (cur) => cur - 1);
      newNodePosition = new Set(nodesListPosition as Array<NodePosition>);
    }
    return newNodePosition;
  }

  function positionsBaseRemoval(removePositions: Set<NodePosition>) {
    removePositions = sortNodeRemoval(removePositions);
    removePositions.forEach((nodePosition) => {
      positionBaseRemoval(nodePosition);
      removePositions = adjustNodePosition(removePositions, nodePosition);
    });
    return void 0;
  }

  function sortNodeRemoval(nodePos: Set<NodePosition>) {
    const positionEntries = [...nodePos];
    return new Set(positionEntries.sort((a, b) => (a > b ? -1 : 1)));
  }

  function removeFirstNode() {
    return positionBaseRemoval(1);
  }

  function derefLastNode(node: SingleDirectedNode<T>) {
    tranverseNode(node, (curNode, _, exitTraversal) => {
      if (curNode.next && curNode.next.next === null) {
        curNode.next = null;
        exitTraversal();
      }
    });
  }

  function removeLastNode() {
    if (head && !head.next) {
      head = null;
      return void 0;
    }
    if (head) {
      derefLastNode(head);
    }
  }

  const mutableOpVariant = [
    appendNode,
    prependNode,
    map,
    removeNode,
    removeNodes,
    positionBaseRemoval,
    positionsBaseRemoval,
    removeFirstNode,
    removeLastNode,
  ].map((fn) => {
    type Key = Exclude<keyof SinglyLinkedList<T>, "head">;

    return [
      fn.name as Key,
      function (
        ...args: [...args: Parameters<typeof fn>, immutable?: boolean]
      ) {
        const immutableArg = args[args.length - 1] as boolean;
        if (typeof immutableArg === "boolean" && immutableArg) {
          immutableOperation();
          function immutableOperation() {
            const clone = map((v) => v);
            args.pop();
            (clone[fn.name as Key] as any)(...args);
            return clone;
          }
        }
        return (fn as any)(...args);
      },
    ];
  });

  const linkOperation = sealObject({
    get head() {
      return head;
    },
    ...Object.fromEntries(mutableOpVariant as any),
  }) as SinglyLinkedList<T>;

  return linkOperation;
}
