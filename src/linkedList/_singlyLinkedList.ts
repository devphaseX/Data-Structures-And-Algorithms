import {
  PredicateFn,
  SingleDirectedNode,
  SinglyLinkedList,
  NodePosition,
  SingleReferenceNode,
  SinglyNodeOption,
} from "./type";
import { sealObject } from "../util/index.js";
import {
  createImmutableStructure,
  derefLastNode,
  getNodeTail,
  tranverseNode,
  createLinkNode,
  _positionsBaseRemoval,
} from "./util.js";

interface SinglyNodeConfig<T> {
  initialData?: T | Array<T>;
  isCircular: boolean;
}
export function _createSinglyLinkedList<T>(
  nodeOption: SinglyNodeConfig<T>
): SinglyLinkedList<T>;
export function _createSinglyLinkedList<T>(
  nodeOption: Required<SinglyNodeConfig<T>>
): SinglyLinkedList<T>;
export function _createSinglyLinkedList<T>(
  option: SinglyNodeConfig<T>
): SinglyLinkedList<T> {
  const nodeOption = { ...option, type: "single" } as SinglyNodeOption<T>;
  let head: SingleReferenceNode<T> | null = null;

  if (nodeOption.initialData) {
    head = createLinkNode(nodeOption);
  }

  let tail: SingleDirectedNode<T> | null = null;

  if (nodeOption.isCircular) {
    tail =
      head &&
      getNodeTail(head, {
        isCircular: nodeOption.isCircular,
        direction: "next",
      });
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
      } else {
        head = head.next;
        if (nodeOption.isCircular) {
          if (tail) {
            tail.next = head;
          }
        }
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
        curPosition,
        nodeOption
      );
    }
  }

  function appendNode(data: T) {
    if (!head) {
      head = createLinkNode({ ...nodeOption, initialData: data });
    } else {
      const tailNode = getNodeTail(head, {
        isCircular: Boolean(nodeOption.isCircular),
        direction: "next",
      });
      tailNode.next = createLinkNode({ ...nodeOption, initialData: data });
      tail = tailNode.next;
      if (nodeOption.isCircular) {
        tailNode.next.next = head;
      }
    }
  }

  const prependNode = function (data: T) {
    if (!head) {
      return void (head = createLinkNode({ ...nodeOption, initialData: data }));
    }
    const newHead = createLinkNode({ ...nodeOption, initialData: data });
    newHead.next = head;
    head = newHead;

    if (nodeOption.isCircular) {
      if (tail) {
        tail.next = newHead;
      } else {
        tail = newHead;
      }
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

    if (head) {
      tranverseNode(
        head,
        (curNode) => {
          newLinks.appendNode(mapFn(curNode.data));
        },
        1,
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

  function positionsBaseRemoval(nodePosition: Set<NodePosition>) {
    return _positionsBaseRemoval(nodePosition, positionBaseRemoval);
  }
  function removeFirstNode() {
    return positionBaseRemoval(1);
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
  }) as SinglyLinkedList<T>;

  return linkOperation;
}
