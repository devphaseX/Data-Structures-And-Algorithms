import {
  PredicateFn,
  SinglyLinkedList,
  NodePosition,
  SingleReferenceNode,
  SinglyNodeOption,
  CircularLinkedList,
  LinkTraversalFn,
  LinkListType,
  NodeReference,
  RebuildFn,
} from './type';
import {
  containValueInList,
  pipe,
  sealObject,
  unary,
} from '../../util/index.js';
import {
  derefLastNode,
  tranverseNode,
  _positionsBaseRemoval,
  hasInvalidRange,
  unwrapNodeData,
  TranversalFn,
  iterableLinkNode,
  createLinkListImmutableAction,
  reverseLinkedNode,
  unwrapNodeOnHeadDetect,
  unwrapNode,
  createNthNode,
} from './util.js';

interface SinglyNodeConfig<T> {
  initialData?: T | Array<T>;
  isCircular: boolean;
}

export function _createSinglyLinkedList<T>(
  option: SinglyNodeConfig<T>,
  rebuilder: RebuildFn
): SinglyLinkedList<T> | CircularLinkedList<T> {
  const nodeOption = <SinglyNodeOption<T>>{ ...option, type: 'single' };
  let head: SingleReferenceNode<T> | null = null;
  let tail: SingleReferenceNode<T> | null = head;
  let size = 0;
  if (nodeOption.initialData) {
    ({
      head,
      tail,
      length: size,
    } = createNthNode(containValueInList(nodeOption.initialData), {
      type: 'single',
      ...option,
    }));
  }

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
        head = tail = null;
        size = 0;
      } else {
        head = head.next;
        if (nodeOption.isCircular) {
          if (tail) {
            tail.next = head;
          }
        }
        size -= 1;
      }
      if (stopOnFirstOccurence) {
        return void 0;
      } else {
        return void (head && derefNode(predicate, (curPosition ?? 1) + 1));
      }
    }

    const detachMatchNode = (
      initial: NonNullable<typeof head>
    ): TranversalFn<typeof initial> => {
      let beforeNode = initial;
      return function (curNode, position, { abortTarversal }) {
        if (predicate(curNode.data, position)) {
          beforeNode.next = curNode.next;
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
      type: 'single',
      ...option,
    });

    createNthNode([1], { type: 'single', isCircular: true });
    size += nodeLink.length;
    if (!head) {
      ({ head, tail } = nodeLink);
    } else {
      tail!.next = nodeLink.head;
      tail = nodeLink.tail;
      if (nodeOption.isCircular) {
        tail.next = head;
      }
    }
  }

  const prependNode = function (data: T | Array<T>) {
    const nodeLink = createNthNode(containValueInList(data), {
      type: 'single',
      ...option,
    });
    size += nodeLink.length;
    if (!head) {
      ({ head, tail } = nodeLink);
      return void 0;
    }
    nodeLink.head.next = head;
    ({ head, tail } = nodeLink);

    if (nodeOption.isCircular) {
      tail.next = head;
    }
  };

  const removeNode = function (predicate: PredicateFn<T>): void {
    return void derefNode(predicate, 1, true);
  };

  const removeNodes = function (predicate: PredicateFn<T>): void {
    return void derefNode(predicate);
  };

  function mapNode<U>(mapFn: (value: T) => U) {
    const newLinks = rebuilder<U>(null) as SinglyLinkedList<U>;
    forEach((data) => {
      newLinks.appendNode(mapFn(data));
    });
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

  function forEach(traverseFn: LinkTraversalFn<T>) {
    if (!head) return;
    tranverseNode(head, unwrapNodeData(traverseFn), nodeOption);
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

  function positionsBaseRemoval(nodePosition: Set<NodePosition>) {
    return _positionsBaseRemoval(nodePosition, positionBaseRemoval);
  }

  function removeFirstNode() {
    return positionBaseRemoval(1);
  }

  function removeLastNode() {
    if (head && !head.next) {
      head = null;
      size = 0;
      return void 0;
    }
    if (head) {
      size -= 1;
      derefLastNode(head, nodeOption.isCircular);
    }
  }

  function emptyLinkedList() {
    head = tail = null;
    size = 0;
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

  const linkOperation = sealObject({
    get head() {
      return head;
    },
    get size() {
      return size;
    },
    forEach,
    getNodeList,
    getNodeData,
    merge,
    rebuild: rebuilder as any,
    ...mutableStateFns,
    [Symbol.iterator]: iterableLinkNode<T>(() => head, nodeOption.isCircular),
  }) as SinglyLinkedList<T>;

  return createLinkListImmutableAction(linkOperation, mapNode, [
    rebuilder,
    forEach,
    getNodeList,
    merge,
  ]);
}
