import {
  containValueInList,
  pipe,
  sealObject,
  unary,
} from '../../util/index.js';
import {
  derefLastNode,
  tranverseNode,
  createNthNode,
  _positionsBaseRemoval,
  hasInvalidRange,
  unwrapNodeData,
  TranversalFn,
  iterableLinkNode,
  createLinkListImmutableAction,
  reverseLinkedNode,
  unwrapNodeOnHeadDetect,
  unwrapNode,
} from './util.js';
import {
  CircularDoublyLinkedList,
  DoubleReferenceNode,
  DoublyLinkedList,
  DoublyNodeOption,
  LinkListEntry,
  LinkListType,
  LinkTraversalFn,
  LinkType,
  NodePosition,
  NodeReference,
  PredicateFn,
  RebuildFn,
} from './type';

interface DoublyNodeConfig<T> {
  initialData?: T | Array<T>;
  isCircular: boolean;
}

export function _createDoublyLinkedList<T>(
  option: DoublyNodeConfig<T>,
  rebuilder: RebuildFn
): DoublyLinkedList<T> | CircularDoublyLinkedList<T> {
  const nodeOption = <DoublyNodeOption<T>>{ ...option, type: 'double' };
  let head: DoubleReferenceNode<T> | null = null;
  let tail: DoubleReferenceNode<T> | null = head;
  let size = 0;
  if (nodeOption.initialData) {
    ({
      head,
      tail,
      length: size,
    } = createNthNode(containValueInList(nodeOption.initialData), {
      type: 'double',
      ...option,
    }));
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
      return function searchForNode(curNode, position, { abortTarversal }) {
        if (predicate(curNode.data, position)) {
          beforeNode.next = curNode.next;

          if (curNode.next) {
            curNode.next.prev = beforeNode;
          }

          size -= 1;
          if (stopOnFirstOccurence) {
            return abortTarversal();
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
    const nodeLink = createNthNode(containValueInList(data), {
      type: 'double',
      ...option,
    });
    size += nodeLink.length;

    if (!head) {
      return void ({ head, tail } = nodeLink);
    } else {
      let lastNode = tail!;
      lastNode.next = nodeLink.head;
      lastNode.next.prev = lastNode;
      tail = nodeLink.tail;

      if (nodeOption.isCircular) {
        tail.prev = head;
      }
    }
  }

  const prependNode = function (data: T | Array<T>) {
    const nodeLink = createNthNode(containValueInList(data), {
      type: 'double',
      ...option,
    });
    size += nodeLink.length;

    if (!head) {
      return void ({ head, tail } = nodeLink);
    }

    nodeLink.tail.next = head;
    head.prev = nodeLink.tail;
    head = nodeLink.head;

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
    const newLinks = rebuilder<U>(null);
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

    if (!startNode) return;

    return void tranverseNode(startNode, unwrapNodeData(traverseFn), {
      direction,
      ...nodeOption,
    });
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

  function reverse() {
    if (head) {
      let prevHead = head;
      head = reverseLinkedNode(head, nodeOption.isCircular);
      tail = prevHead;
    }
  }

  function merge(linked: LinkListType<T> | NodeReference<T>) {
    const linkedHead = unwrapNodeOnHeadDetect(linked);
    if (linkedHead) {
      const appendUnwrapNode = pipe(
        unary<typeof linkedHead, T>(unwrapNode),
        unary<T, void>(linkOperation.appendNode)
      );
      tranverseNode(linkedHead, appendUnwrapNode, option);
    }
    return { size, self: linkOperation };
  }

  const mutableStateFns = {
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
    reverse,
  };

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
    merge,
    rebuild: rebuilder,
    ...(mutableStateFns as any),
    [Symbol.iterator]: iterableLinkNode<T>(() => head, nodeOption.isCircular),
  }) as DoublyLinkedList<T>;

  return createLinkListImmutableAction(linkOperation, mapNode as any, [
    rebuilder,
    forEach,
    getNodeList,
    merge,
  ]);
}
