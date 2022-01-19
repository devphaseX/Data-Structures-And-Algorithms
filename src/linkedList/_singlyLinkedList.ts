import {
  PredicateFn,
  SinglyLinkedList,
  NodePosition,
  SingleReferenceNode,
  SinglyNodeOption,
  CircularLinkedList,
  LinkTraversalFn,
} from './type';
import { sealObject } from '../util/index.js';
import {
  createImmutableStructure,
  derefLastNode,
  tranverseNode,
  createLinkNode,
  _positionsBaseRemoval,
  hasInvalidRange,
  guardNodeReveal,
  TranversalFn,
  iterableLinkNode,
} from './util.js';

interface SinglyNodeConfig<T> {
  initialData?: T | Array<T>;
  isCircular: boolean;
}

export function _createSinglyLinkedList<T>(
  nodeOption: SinglyNodeConfig<T>
): SinglyLinkedList<T> | CircularLinkedList<T>;
export function _createSinglyLinkedList<T>(
  nodeOption: Required<SinglyNodeConfig<T>>
): SinglyLinkedList<T> | CircularLinkedList<T>;
export function _createSinglyLinkedList<T>(
  option: SinglyNodeConfig<T>
): SinglyLinkedList<T> | CircularLinkedList<T> {
  const nodeOption = <SinglyNodeOption<T>>{ ...option, type: 'single' };
  let head: SingleReferenceNode<T> | null = null;
  let tail: SingleReferenceNode<T> | null = head;
  let size = 0;
  if (nodeOption.initialData) {
    const nodeLink = createLinkNode(nodeOption, true);
    ({ root: head, tail: tail, size } = nodeLink);
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
      return function (curNode, position, abortTraverse) {
        if (predicate(curNode.data, position)) {
          beforeNode.next = curNode.next;
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

  function appendNode(data: T) {
    const nodeLink = createLinkNode({ ...nodeOption, initialData: data }, true);
    size += nodeLink.size;
    if (!head) {
      ({ root: head, tail } = nodeLink);
    } else {
      tail!.next = nodeLink.root;
      tail = nodeLink.tail;
      if (nodeOption.isCircular) {
        tail.next = head;
      }
    }
  }

  const prependNode = function (data: T) {
    const nodeLink = createLinkNode({ ...nodeOption, initialData: data }, true);
    size += nodeLink.size;
    if (!head) {
      ({ root: head, tail } = nodeLink);
      return void 0;
    }
    nodeLink.root.next = head;
    ({ root: head, tail } = nodeLink);

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
    const { initialData, ...delegateConfig } = nodeOption;
    const newLinks = _createSinglyLinkedList<U>(delegateConfig);
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
    if (head) {
      return void tranverseNode(head, guardNodeReveal(traverseFn));
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
  ];

  const immutableFnVariant = createImmutableStructure(mutableStateFns, mapNode);
  const linkOperation = sealObject({
    get head() {
      return head;
    },
    get size() {
      return size;
    },
    forEach,
    [Symbol.iterator]: iterableLinkNode<T>(() => head, nodeOption.isCircular),
    getNodeList,
    ...Object.fromEntries(immutableFnVariant as any),
  }) as SinglyLinkedList<T>;

  return linkOperation;
}
