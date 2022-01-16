import { sealObject } from "../util/index.js";
import {
  createImmutableStructure,
  derefLastNode,
  tranverseNode,
  createLinkNode,
  _positionsBaseRemoval,
  hasInvalidRange,
  unwrapLinkDataForExternal,
} from "./util.js";
import {
  CircularDoublyLinkedList,
  DoubleReferenceNode,
  DoublyLinkedList,
  DoublyNodeOption,
  LinkTraversalFn,
  LinkType,
  NodePosition,
  PredicateFn,
} from "./type";

interface DoublyNodeConfig<T> {
  initialData?: T | Array<T>;
  isCircular: boolean;
}

export function _createDoublyLinkedList<T>(
  option: DoublyNodeConfig<T>
): DoublyLinkedList<T> | CircularDoublyLinkedList<T>;
export function _createDoublyLinkedList<T>(
  option: Required<DoublyNodeConfig<T>>
): DoublyLinkedList<T> | CircularDoublyLinkedList<T>;
export function _createDoublyLinkedList<T>(
  option: DoublyNodeConfig<T>
): DoublyLinkedList<T> | CircularDoublyLinkedList<T> {
  const nodeOption = <DoublyNodeOption<T>>{ ...option, type: "double" };
  let head: DoubleReferenceNode<T> | null = null;
  let tail: DoubleReferenceNode<T> | null = head;
  if (nodeOption.initialData) {
    const nodeLink = createLinkNode(nodeOption, true);
    ({ root: head, tail: tail } = nodeLink);
  }

  function derefNode(
    predicate: PredicateFn<T>,
    nodeLinkType: LinkType,
    curPosition?: number,
    stopOnFirstOccurence?: boolean
  ): void {
    if (!head) {
      return;
    }

    if (predicate(head.data, curPosition ?? 1)) {
      if (!head.next) {
        head = null;
        tail = null;
      } else {
        head = head.next;
        head.prev = nodeOption.isCircular ? tail : null;
        tail!.next = nodeOption.isCircular ? head : null;
      }

      if (stopOnFirstOccurence) {
        return void 0;
      } else {
        return void (
          head && derefNode(predicate, nodeLinkType, (curPosition ?? 1) + 1)
        );
      }
    }

    if (head) {
      let beforeNode = head;
      tranverseNode(
        head,
        (curNode, position, abortTraverse) => {
          if (predicate(curNode.data, position)) {
            beforeNode.next = curNode.next;

            if (curNode.next) {
              curNode.next.prev = beforeNode;
            }

            if (stopOnFirstOccurence) {
              return abortTraverse();
            }
          }
          beforeNode = curNode;
        },
        nodeOption,
        curPosition
      );
    }
  }

  function appendNode(data: T | Array<T>) {
    const nodeLink = createLinkNode({ ...nodeOption, initialData: data }, true);
    if (!head) {
      return void ({ root: head, tail } = nodeLink);
    } else {
      let lastNode = tail!;
      lastNode.next = nodeLink.root;
      lastNode.next.prev = lastNode;
      tail = nodeLink.tail;

      if (nodeOption.isCircular) {
        tail.prev = head;
      }
    }
  }

  const prependNode = function (data: T | Array<T>) {
    const nodeLink = createLinkNode({ ...nodeOption, initialData: data }, true);
    if (!head) {
      return void ({ root: head, tail } = nodeLink);
    }

    nodeLink.tail.next = head;
    head.prev = nodeLink.tail;
    head = nodeLink.root;

    if (nodeOption.isCircular) {
      head.prev = tail;
      tail!.next = head;
    }
  };

  const removeNode = function (predicate: PredicateFn<T>): void {
    return void derefNode(predicate, "double", 1, true);
  };

  const removeNodes = function (predicate: PredicateFn<T>): void {
    return void derefNode(predicate, "double");
  };

  function mapNode<U>(mapFn: (value: T) => U) {
    const { initialData, ...delegateConfig } = nodeOption;
    const newLinks = _createDoublyLinkedList<U>(delegateConfig);

    forEach("head", (data) => newLinks.appendNode(mapFn(data)));
    return newLinks;
  }

  function positionBaseRemoval(selectPosition: number) {
    const isInvalidRange = hasInvalidRange(selectPosition);
    if (isInvalidRange) {
      throw new TypeError(
        `The value provided for the position is'nt valid,
       negative number, NaN, Infinity value are not supported`
      );
    }
    return removeNode(function (_, nodePosition) {
      return nodePosition === selectPosition;
    });
  }

  function forEach(
    startPoint: "head" | "tail",
    traverseFn: LinkTraversalFn<T>
  ) {
    const direction = startPoint === "tail" ? "prev" : "next";
    const startNode = direction === "prev" ? tail : head;
    if (startNode) {
      return void tranverseNode(
        startNode,
        unwrapLinkDataForExternal(traverseFn),
        {
          direction,
          ...nodeOption,
        }
      );
    }
  }

  function getNodeList() {
    const dataList: Array<T> = [];
    if (head) {
      forEach("head", (data) => {
        dataList.push(data);
      });
    }
    return dataList;
  }

  function removeFirstNode() {
    return positionBaseRemoval(1);
  }

  function removeLastNode() {
    if (head && !head.next) {
      head = tail = null;
      return void 0;
    }
    if (head) {
      derefLastNode(head, nodeOption.isCircular);
    }
  }

  function positionsBaseRemoval(nodePosition: Set<NodePosition>) {
    return _positionsBaseRemoval(nodePosition, positionBaseRemoval);
  }

  const mutableOpVariant = createImmutableStructure(
    [
      appendNode,
      prependNode,
      mapNode,
      removeNode,
      removeNodes,
      positionBaseRemoval,
      positionsBaseRemoval,
      removeFirstNode,
      removeLastNode,
    ],
    mapNode
  );

  const linkOperation = sealObject({
    get head() {
      return head;
    },
    getNodeList,
    forEach,
    ...Object.fromEntries(mutableOpVariant as any),
  }) as DoublyLinkedList<T>;

  return linkOperation;
}
