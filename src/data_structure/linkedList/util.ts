import {
  slice,
  normaliseAccessorProps,
  createImmutableAction,
} from '../../util/index.js';
import { Fun } from '../../util/type';
import {
  DoubleReferenceNode,
  DoublyNodeOption,
  LinkBoundary,
  LinkListMapperFn,
  LinkListType,
  LinkOption,
  LinkTraversalFn,
  LinkTraverseDirection,
  NodeOption,
  NodePosition,
  NodeReference,
  SingleReferenceNode,
  SinglyNodeOption,
} from './type';

export const SINGLE_DIRECTED_NODE =
  Symbol('SINGLE_DIRECTED_NODE') || 'SINGLE_DIRECTED_NODE';

export const SINGLE_CIRCULAR_DIRECTED_NODE =
  Symbol('SINGLE_CIRCULAR_DIRECTED_NODE') || 'SINGLE_CIRCULAR_DIRECTED_NODE';

export const DOUBLE_DIRECTED_NODE =
  Symbol('DOUBLE_DIRECTED_NODE') || 'DOUBLE_DIRECTED_NODE';

export const DOUBLE_CIRCULAR_DIRECTED_NODE =
  Symbol('DOUBLE_CIRCULAR_DIRECTED_NODE') || 'DOUBLE_CIRCULAR_DIRECTED_NODE';

function createSingleNode<T>(
  data: T,
  isCircular?: boolean
): SingleReferenceNode<T> {
  if (isCircular) {
    return {
      data,
      get next() {
        return this;
      },
      _type_: SINGLE_CIRCULAR_DIRECTED_NODE,
    };
  }
  return { data, next: null, _type_: SINGLE_DIRECTED_NODE };
}

function createDoubleNode<T>(
  data: T,
  isCircular?: boolean
): DoubleReferenceNode<T> {
  if (isCircular) {
    return {
      data,
      get prev() {
        return this;
      },
      get next() {
        return this;
      },
      _type_: DOUBLE_CIRCULAR_DIRECTED_NODE,
    };
  }
  return { data, prev: null, next: null, _type_: DOUBLE_DIRECTED_NODE };
}

export function detectCircularNode<Node extends NodeReference<any>>(
  node: Node
) {
  return [
    DOUBLE_CIRCULAR_DIRECTED_NODE,
    SINGLE_CIRCULAR_DIRECTED_NODE,
  ].includes(node._type_);
}
export interface TraverseOption<LinkNode> {
  abortTarversal(): void;
  setNextNode(newNextNode: LinkNode): void;
}
export type TranversalFn<LinkNode> = (
  node: LinkNode,
  position: number,
  traverseOption: TraverseOption<LinkNode>
) => void;

interface TranverseLink {
  <LinkNode extends NodeReference<any>>(
    linkedNode: LinkNode,
    traversal: TranversalFn<LinkNode>,
    linkOptions?: Partial<LinkOption>,
    initialNodePosition?: number
  ): void;
}
let tranverseNode: TranverseLink;

{
  const defaulLinkOptions: LinkOption = {
    direction: 'next',
    isCircular: false,
  };

  tranverseNode = function tranverseLink<LinkNode extends NodeReference<any>>(
    linkedNode: LinkNode,
    traversal: TranversalFn<LinkNode>,
    linkOptions?: Partial<LinkOption>,
    initialNodePosition?: number
  ) {
    const direction =
      (linkOptions && linkOptions.direction) || defaulLinkOptions.direction;
    const isCircular =
      (linkOptions && linkOptions.isCircular) || defaulLinkOptions.isCircular;

    const startNode = linkedNode;

    function traverseNodes(
      node: LinkNode | null,
      direction: LinkTraverseDirection,
      isCircular: boolean,
      traversal: TranversalFn<LinkNode>,
      position: number,
      traversedNodes: WeakSet<LinkNode>
    ): void {
      if (node === null || (traversedNodes.has(node) && isCircular)) {
        return;
      }

      if (traversedNodes.has(node) && !isCircular) {
        throw new TypeError(
          'A node cycle reference is found,\
           isCircular is set to "false", setting isCircular to "true" resolve the cycle reference'
        );
      }

      let nextNode = node.next as LinkNode | null;
      let bypassLoopCheck = { bypass: false, step: 1 };

      {
        let isTraverseAbort = false;

        function abortTarversal() {
          isTraverseAbort = true;
        }

        function setNextNode(
          newNextNode: NonNullable<typeof node>,
          step?: number
        ) {
          if (!traversedNodes.has(newNextNode)) {
            if (newNextNode !== nextNode) nextNode = newNextNode;
            bypassLoopCheck = {
              bypass: true,
              step: step ?? bypassLoopCheck.step,
            };

            if (
              isCircular &&
              newNextNode.next &&
              traversedNodes.has(newNextNode.next as LinkNode)
            ) {
              abortTarversal();
            }
          }
        }

        traversal(node, position, { abortTarversal, setNextNode });

        if (isTraverseAbort) {
          return;
        }
      }

      traversedNodes.add(node);
      if (!bypassLoopCheck.bypass && nextNode && nextNode !== node.next) {
        throw new TypeError(
          'Mutation of linked node during traversal is void, to prevent infinite loop.'
        );
      }

      return traverseNodes(
        nextNode,
        direction,
        isCircular,
        traversal,
        position + bypassLoopCheck.step,
        traversedNodes
      );
    }

    return traverseNodes(
      startNode,
      direction as any,
      isCircular,
      traversal,
      initialNodePosition || 1,
      new WeakSet()
    );
  };
}

export { tranverseNode };

export function sortNodeRemoval(nodePos: Set<NodePosition>) {
  const positionEntries = [...nodePos];
  return new Set(positionEntries.sort((a, b) => (a > b ? -1 : 1)));
}

export function adjustNodePosition(
  nodePosition: Set<NodePosition>,
  curPositon: NodePosition
) {
  let newNodePosition = new Set(nodePosition);
  if (nodePosition.has(curPositon)) {
    newNodePosition.delete(curPositon);
    {
      const nodesListPosition = Array.from(newNodePosition, (cur) => cur - 1);
      newNodePosition = new Set(nodesListPosition as Array<NodePosition>);
    }
  }
  return newNodePosition;
}

export function _positionsBaseRemoval(
  removePositions: Set<NodePosition>,
  positionBaseRemoval: (pos: NodePosition) => void
) {
  removePositions = sortNodeRemoval(removePositions);
  removePositions.forEach((nodePosition) => {
    positionBaseRemoval(nodePosition);
    removePositions = adjustNodePosition(removePositions, nodePosition);
  });
  return void 0;
}

export function derefLastNode<T>(
  rootNode: NodeReference<T>,
  isCircular?: boolean
) {
  let data!: T;
  let lastNode = rootNode;
  tranverseNode(rootNode, (curNode, _, { abortTarversal: exitTraversal }) => {
    if ([rootNode, null].includes(curNode.next)) {
      data = curNode.data;

      switch (isCircular) {
        case true: {
          lastNode.next = rootNode;
          if (isLinkDouble(rootNode) && isLinkDouble(lastNode)) {
            rootNode.prev = lastNode;
          }
        }
        case false: {
          lastNode.next = null;
        }
      }
      exitTraversal();
    }

    lastNode = curNode;
  });
  return data;
}

export function createLinkNode<T>(
  nodeOptions: SinglyNodeOption<T>
): SingleReferenceNode<T>;
export function createLinkNode<T>(
  nodeOptions: SinglyNodeOption<T>,
  isBoundAllow: true
): LinkBoundary<SingleReferenceNode<T>>;
export function createLinkNode<T>(
  nodeOptions: SinglyNodeOption<T>,
  isBoundAllow?: boolean
): LinkBoundary<SingleReferenceNode<T>> | SingleReferenceNode<T>;
export function createLinkNode<T>(
  nodeOptions: DoublyNodeOption<T>
): DoubleReferenceNode<T>;

export function createLinkNode<T>(
  nodeOptions: DoublyNodeOption<T>,
  isBoundAllow: true
): LinkBoundary<DoubleReferenceNode<T>>;

export function createLinkNode<T>(
  nodeOptions: SinglyNodeOption<T>,
  isBoundAllow?: boolean
): LinkBoundary<DoubleReferenceNode<T>> | DoubleReferenceNode<T>;

export function createLinkNode<T>(nodeOptions: NodeOption<T>): NodeReference<T>;
export function createLinkNode<T>(
  nodeOptions: NodeOption<T>,
  isBoundAllow?: boolean
): NodeReference<T> | LinkBoundary<NodeReference<T>>;

export function createLinkNode<T>(
  nodeOptions: NodeOption<T>,
  isBoundAllow?: boolean
): NodeReference<T> | LinkBoundary<NodeReference<T>> {
  const { initialData, ...nodeOption } = nodeOptions;

  if (!Array.isArray(initialData)) {
    const node = createNode(initialData, nodeOption);
    if (isBoundAllow) {
      return { root: node, tail: node, size: 1 };
    } else {
      return node;
    }
  }

  if (initialData.length < 1) {
    throw new TypeError("Node can't can created from an empty list");
  }

  let nodes = initialData.map((data) =>
    createLinkNode({ initialData: data, ...nodeOption })
  );

  return connectLinkNodes(nodes, nodeOption.isCircular, Boolean(isBoundAllow));
}

function connectLinkNodes<T>(
  refs: Array<NodeReference<T>>,
  isCircular: boolean
): NodeReference<T>;

function connectLinkNodes<T>(
  refs: Array<NodeReference<T>>,
  isCircular: boolean,
  isBoundAllow: true
): LinkBoundary<NodeReference<T>>;

function connectLinkNodes<T>(
  refs: Array<NodeReference<T>>,
  isCircular: boolean,
  isBoundAllow: boolean
): NodeReference<T> | LinkBoundary<NodeReference<T>>;

function connectLinkNodes<T>(
  refs: Array<NodeReference<T>>,
  isCircular: boolean,
  includeTail?: boolean
): NodeReference<T> | LinkBoundary<NodeReference<T>> {
  let root = refs[0];
  let last = root;
  for (let sibling of slice(refs, 1)) {
    last.next = sibling;
    if (isLinkDouble(sibling) && isLinkDouble(last)) {
      sibling.prev = last;
    }
    last = sibling;
  }

  if (isCircular) {
    last.next = root;
    if (isLinkDouble(last) && isLinkDouble(root)) {
      root.prev = last;
    }
  }

  if (includeTail) {
    return { root, tail: last, size: refs.length };
  }
  return root;
}

export function isLinkDouble<T>(
  node: NodeReference<T>
): node is DoubleReferenceNode<T> {
  return 'prev' in node;
}

function createNode<T>(
  initial: T,
  nodeOption: Omit<NodeOption<T>, 'initialData'>
): DoubleReferenceNode<T> | SingleReferenceNode<T> {
  let nodeReference: NodeReference<T>;
  if (nodeOption.type === 'single') {
    nodeReference = createSingleNode(initial, nodeOption.isCircular);
  } else {
    nodeReference = createDoubleNode(initial, nodeOption.isCircular);
  }
  return normaliseAccessorProps(nodeReference);
}

export function hasInvalidRange(range: number) {
  return range < 1 || Number.isNaN(range) || !Number.isFinite(range);
}

export function unwrapNodeData<T, Node extends NodeReference<T>>(
  traversalFn: LinkTraversalFn<T>
) {
  return function (
    node: Node,
    position: number,
    { abortTarversal }: TraverseOption<Node>
  ) {
    return void traversalFn(unwrapNode(node), position, abortTarversal);
  };
}

export function unwrapNode<T>(node: NodeReference<T>) {
  return node.data;
}

export function iterableLinkNode<T = unknown>(
  closeOverLinkFn: () => NodeReference<T> | null,
  isCircular: boolean
) {
  return function* iterator() {
    let currentNode = closeOverLinkFn();
    do {
      if (!currentNode) {
        break;
      }
      yield currentNode.data;
      currentNode = currentNode.next;
    } while (
      currentNode &&
      ((isCircular && currentNode.next !== closeOverLinkFn()) ||
        (!isCircular && currentNode.next))
    );
  };
}

export function dataKeeper<T>() {
  let values: Array<T> | null = [];
  return {
    deref() {
      values = null;
    },
    currentValues() {
      return values && slice(values, 0);
    },
    collect(value: T | Array<T>) {
      values ||= Array.isArray(value) ? [...value] : [value];
      values &&= Array.isArray(value)
        ? [...values, ...value]
        : [...values, value];
    },
  };
}

export function createLinkListImmutableAction<
  LinkedList extends LinkListType<any>
>(
  linkedList: LinkedList,
  mapper: (fn: LinkListMapperFn<LinkedList>) => LinkedList,
  whiteList?: Array<LinkedList[keyof LinkedList]>
) {
  return createImmutableAction(
    linkedList,
    function (methodKey, dependencies) {
      const clone = mapper((v) => v);
      {
        const mutableMethod: Fun = (clone as any)[methodKey];
        mutableMethod(dependencies);
      }
      return clone;
    },
    whiteList
  );
}

export function reverseLinkedNode<Node extends NodeReference<any>>(
  rootNode: Node,
  isCircular: boolean
) {
  let prevNode = rootNode;
  let isDoubleLinkDetect = isLinkDouble(rootNode);
  if (rootNode.next && rootNode.next !== prevNode) {
    tranverseNode(
      rootNode.next,
      (curNode, _, { setNextNode }) => {
        if (curNode.next) setNextNode(curNode.next);
        curNode.next = prevNode;
        if (isDoubleLinkDetect) {
          (prevNode as DoubleReferenceNode<any>).prev =
            curNode as DoubleReferenceNode<any>;
        }
        prevNode = curNode as any;
      },
      { isCircular }
    );
  }

  rootNode.next = isCircular ? prevNode : null;
  if (isLinkDouble(rootNode) && isLinkDouble(prevNode)) {
    prevNode.prev = isCircular ? rootNode : null;
  }
  return prevNode;
}

export function isLinkShaped(value: any) {
  return 'next' in value && typeof value.next === 'object';
}

export function unwrapNodeOnHeadDetect<U>(
  linked: LinkListType<U> | NodeReference<U>
) {
  return 'head' in linked ? linked.head : linked;
}

export function linkListRebuilder<T>(rebuilder: T) {
  return {
    rebuild() {
      return rebuilder;
    },
  };
}

export function makeLinkedConfigurable<T>(
  isCircular: boolean,
  initialData?: T | Array<T> | null
) {
  return { isCircular, ...(initialData ? { initialData } : null) };
}
