import { sealObject } from '../../util/index.js';
import {
  derefLastNode,
  tranverseNode,
  createLinkNode,
  _positionsBaseRemoval,
  hasInvalidRange,
  guardNodeReveal,
  TranversalFn,
  iterableLinkNode,
  createLinkListImmutableAction,
} from './util.js';
import {
  CircularDoublyLinkedList,
  DoubleReferenceNode,
  DoublyLinkedList,
  DoublyNodeOption,
  LinkListEntry,
  LinkTraversalFn,
  LinkType,
  NodePosition,
  PredicateFn,
} from './type';

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
  const nodeOption = <DoublyNodeOption<T>>{ ...option, type: 'double' };
  let head: DoubleReferenceNode<T> | null = null;
  let tail: DoubleReferenceNode<T> | null = head;
  let size = 0;
  if (nodeOption.initialData) {
    const nodeLink = createLinkNode(nodeOption, true);
    ({ root: head, tail: tail, size } = nodeLink);
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
        size = 0;
      } else {
        head = head.next;
        head.prev = nodeOption.isCircular ? tail : null;
        tail!.next = nodeOption.isCircular ? head : null;
        size -= 1;
      }

      if (stopOnFirstOccurence || head === null) {
        return void 0;
      } else {
        return void (
          head && derefNode(predicate, nodeLinkType, (curPosition ?? 1) + 1)
        );
      }
    }

    const detachMatchNode = (
      initial: NonNullable<typeof head>
    ): TranversalFn<typeof initial> => {
      let beforeNode = initial;
      return function searchForNode(curNode, position, abortTraverse) {
        if (predicate(curNode.data, position)) {
          beforeNode.next = curNode.next;

          if (curNode.next) {
            curNode.next.prev = beforeNode;
          }

          size -= 1;
          if (stopOnFirstOccurence) {
            return abortTraverse();
          }
        }
        beforeNode = curNode;
      };
    };

    if (head) {
      tranverseNode(head, detachMatchNode(head), nodeOption, curPosition);
    }
  }

  function appendNode(data: T | Array<T>) {
    const nodeLink = createLinkNode({ ...nodeOption, initialData: data }, true);
    size += nodeLink.size;

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
    size += nodeLink.size;

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
    return void derefNode(predicate, 'double', 1, true);
  };

  const removeNodes = function (predicate: PredicateFn<T>): void {
    return void derefNode(predicate, 'double');
  };

  function mapNode<U>(mapFn: (value: T) => U) {
    const { initialData, ...delegateConfig } = nodeOption;
    const newLinks = _createDoublyLinkedList<U>(delegateConfig);

    forEach((data) => newLinks.appendNode(mapFn(data)));
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

  function forEach(traverseFn: LinkTraversalFn<T>, startPoint?: LinkListEntry) {
    const direction = startPoint === 'tail' ? 'prev' : 'next';
    const startNode = direction === 'prev' ? tail : head;
    if (startNode) {
      return void tranverseNode(startNode, guardNodeReveal(traverseFn), {
        direction,
        ...nodeOption,
      });
    }
  }

  function getNodeList() {
    const dataList: Array<T> = [];
    if (head) {
      forEach((data) => {
        dataList.push(data);
      });
    }
    return dataList;
  }

  function getNodeData(position: number): T | null;
  function getNodeData(predicate: PredicateFn<T>): T | null;
  function getNodeData(type: number | PredicateFn<T>) {
    let outerData: T | null = null;
    forEach((data, position) => {
      if (typeof type === 'number') {
        position === type && (outerData = data);
      } else {
        if (type(data, position)) {
          outerData = data;
        }
      }
    });
    return outerData;
  }

  function removeFirstNode() {
    return positionBaseRemoval(1);
  }

  function removeLastNode() {
    if (head && !head.next) {
      head = tail = null;
      size = 0;
      return void 0;
    }
    if (head) {
      size -= 1;
      derefLastNode(head, nodeOption.isCircular);
    }
  }

  function positionsBaseRemoval(nodePosition: Set<NodePosition>) {
    return _positionsBaseRemoval(nodePosition, positionBaseRemoval);
  }

  function emptyLinkedList() {
    head = tail = null;
    size = 0;
  }

  const mutableStateFns = [
    appendNode,
    prependNode,
    mapNode,
    removeNode,
    removeNodes,
    positionBaseRemoval,
    positionsBaseRemoval,
    removeFirstNode,
    removeLastNode,
    emptyLinkedList,
  ];

  const linkOperation = sealObject({
    get head() {
      return head;
    },
    get size() {
      return size;
    },
    getNodeList,
    getNodeData,
    forEach,
    ...(mutableStateFns as any),
    [Symbol.iterator]: iterableLinkNode<T>(() => head, nodeOption.isCircular),
  }) as DoublyLinkedList<T>;

  return createLinkListImmutableAction<T, DoublyLinkedList<T>>(
    linkOperation,
    mapNode
  );
}
