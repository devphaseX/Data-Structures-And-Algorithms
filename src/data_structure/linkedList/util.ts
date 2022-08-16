import {
  slice,
  normaliseAccessorProps,
  createImmutableAction,
} from '../../util/index.js';
import { Fun, IntialDataFunction } from '../../util/type';
import {
  DoubleReferenceNode,
  LinkListMapperFn,
  LinkListType,
  LinkOption,
  LinkTraversalFn,
  LinkTraverseDirection,
  NodePosition,
  NodeReference,
  SingleReferenceNode,
} from './type';

export const SINGLE_DIRECTED_NODE =
  Symbol('SINGLE_DIRECTED_NODE') || 'SINGLE_DIRECTED_NODE';

export const SINGLE_CIRCULAR_DIRECTED_NODE =
  Symbol('SINGLE_CIRCULAR_DIRECTED_NODE') || 'SINGLE_CIRCULAR_DIRECTED_NODE';

export const DOUBLE_DIRECTED_NODE =
  Symbol('DOUBLE_DIRECTED_NODE') || 'DOUBLE_DIRECTED_NODE';

export const DOUBLE_CIRCULAR_DIRECTED_NODE =
  Symbol('DOUBLE_CIRCULAR_DIRECTED_NODE') || 'DOUBLE_CIRCULAR_DIRECTED_NODE';

type SingleConfigOption<T> = {
  isCircular?: boolean;
  ref?: { prev: SingleReferenceNode<T> | null };
};
function createSingleNode<T>(
  data: T,
  option: SingleConfigOption<T>
): SingleReferenceNode<T> {
  if (option.isCircular) {
    return {
      data,
      get next() {
        return option.ref?.prev ?? this;
      },
      _type_: SINGLE_CIRCULAR_DIRECTED_NODE,
    };
  }
  return { data, next: null, _type_: SINGLE_DIRECTED_NODE };
}

type DoubleConfigOption<T> = {
  isCircular?: boolean;
  ref?: {
    prev: DoubleReferenceNode<T> | null;
    next?: DoubleReferenceNode<T> | null;
  };
};
function createDoubleNode<T>(
  data: T,
  options: DoubleConfigOption<T>
): DoubleReferenceNode<T> {
  if (options.isCircular) {
    return {
      data,
      get prev() {
        return options.ref?.prev ?? this;
      },
      get next() {
        return options.ref?.next ?? this;
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

type CreateNthNodeOption<Type extends 'single' | 'double'> = {
  isCircular: boolean;
  type: Type;
};

type BoundNodeResult<NodeType> = {
  head: NodeType;
  tail: NodeType;
  length: number;
};

export function createNthNode<T>(
  nodeDatas: Array<T>,
  option: CreateNthNodeOption<'single'>
): BoundNodeResult<SingleReferenceNode<T>>;
export function createNthNode<T>(
  nodeDatas: Array<T>,
  option: CreateNthNodeOption<'double'>
): BoundNodeResult<DoubleReferenceNode<T>>;
export function createNthNode<T>(
  nodeDatas: Array<T>,
  option: CreateNthNodeOption<'single' | 'double'>
): BoundNodeResult<SingleReferenceNode<T> | DoubleReferenceNode<T>>;
export function createNthNode<T>(
  nodeDatas: Array<T>,
  option: CreateNthNodeOption<'single' | 'double'>
) {
  const allowedNodetype = ['single', 'double'] as const;
  if (!allowedNodetype.includes(option.type)) {
    throw new TypeError(
      `Expected a node type of either ${allowedNodetype.join()} but got ${
        option.type
      }`
    );
  }
  const nodeBound: Partial<BoundNodeResult<NodeReference<T>>> = { length: 0 };

  nodeDatas.forEach((data, index) => {
    const currentNode = createNode(data, option.type, {
      ...option,
      ref: nodeBound.tail && { prev: nodeBound.tail },
    });

    nodeBound.head ||= currentNode;
    nodeBound.tail = currentNode;
    nodeBound.length = index + 1;
  });

  return nodeBound as BoundNodeResult<NodeReference<T>>;
}

export function isLinkDouble<T>(
  node: NodeReference<T>
): node is DoubleReferenceNode<T> {
  return 'prev' in node;
}

function createNode<T>(
  value: T,
  type: 'single',
  option: SingleConfigOption<T>
): SingleReferenceNode<T>;
function createNode<T>(
  value: T,
  type: 'double',
  option: DoubleConfigOption<T>
): DoubleReferenceNode<T>;
function createNode<T>(
  value: T,
  type: 'single' | 'double',
  option: SingleConfigOption<T> | DoubleConfigOption<T>
): DoubleReferenceNode<T>;
function createNode<T>(
  value: T,
  type: 'single' | 'double',
  option: SingleConfigOption<T> | DoubleReferenceNode<T>
) {
  let nodeReference: NodeReference<T>;
  if (type === 'single') {
    nodeReference = createSingleNode(value, option as SingleConfigOption<T>);
  } else {
    nodeReference = createDoubleNode(value, option as DoubleConfigOption<T>);
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
  closeOverLinkFn: IntialDataFunction<NodeReference<T> | null>,
  isCircular: boolean
) {
  return function* iterator() {
    let starterNode = closeOverLinkFn();
    let currentNode = starterNode;
    do {
      if (!currentNode) {
        break;
      }
      yield currentNode.data;
      currentNode = currentNode.next;
    } while (
      currentNode &&
      ((isCircular && currentNode.next !== starterNode) ||
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
