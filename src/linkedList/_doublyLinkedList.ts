import { sealObject } from "../util/index.js";
import {
  createImmutableStructure,
  derefLastNode,
  getNodeTail,
  tranverseNode,
  createLinkNode,
  _positionsBaseRemoval,
} from "./util.js";
import {
  DoubleReferenceNode,
  DoublyLinkedList,
  DoublyNodeOption,
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
): DoublyLinkedList<T>;
export function _createDoublyLinkedList<T>(
  option: Required<DoublyNodeConfig<T>>
): DoublyLinkedList<T>;
export function _createDoublyLinkedList<T>(
  option: DoublyNodeConfig<T>
): DoublyLinkedList<T> {
  const nodeOption = { ...option, type: "double" } as DoublyNodeOption<T>;
  let head: DoubleReferenceNode<T> | null = null;
  if (nodeOption.initialData) {
    head = createLinkNode(nodeOption as DoublyNodeOption<T>);
  }

  let tail =
    head &&
    getNodeTail(head, {
      isCircular: Boolean(nodeOption.isCircular),
      direction: "next",
    });

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

  function appendNode(data: T) {
    if (!head) {
      head = createLinkNode({ ...nodeOption, initialData: data });
      tail = head;
    } else {
      let lastNode = tail!;
      lastNode.next = createLinkNode({ ...nodeOption, initialData: data });
      lastNode.next.prev = lastNode;

      if (nodeOption.isCircular) {
        lastNode.next.prev = head;
      }
    }
  }

  const prependNode = function (data: T) {
    if (!head) {
      head = createLinkNode({ ...nodeOption, initialData: data });
      tail = head;

      return void 0;
    }
    const newHead = createLinkNode({ ...nodeOption, initialData: data });
    newHead.next = head;
    head.prev = newHead;
    head = newHead;

    if (nodeOption.isCircular) {
      newHead.prev = tail;
      tail!.next = newHead;
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
    if (head) {
      tranverseNode(
        head,
        (curNode) => {
          newLinks.appendNode(mapFn(curNode.data));
        },
        delegateConfig
      );
    }
    return newLinks;
  }

  function positionBaseRemoval(selectPosition: number) {
    return removeNode(function (_, nodePosition) {
      return nodePosition === selectPosition;
    });
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
    ...Object.fromEntries(mutableOpVariant as any),
  }) as DoublyLinkedList<T>;

  return linkOperation;
}
