import {
  map,
  slice,
  normaliseAccessorProps,
  createImmutableAction,
} from '../../util/index.js';
import { Fun } from '../../util/type';
import {
  DoubleReferenceNode,
  DoublyNodeOption,
  GetLinkedListDataType,
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
    };
  }
  return { data, next: null };
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
    };
  }
  return { data, prev: null, next: null };
}

export type TranversalFn<LinkNode> = (
  node: LinkNode,
  position: number,
  abortTraversel: () => void
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

      const nextNode = node.next;
      let isTraverseAbort = false;

      function abortTarversal() {
        isTraverseAbort = true;
      }

      traversal(node, position, abortTarversal);

      if (isTraverseAbort) {
        return;
      }

      traversedNodes.add(node);

      if (nextNode !== node.next) {
        throw new TypeError(
          'Mutation of linked node during traversal is void, to prevent infinite loop.'
        );
      }

      return traverseNodes(
        node[direction as keyof NodeReference<any>],
        direction,
        isCircular,
        traversal,
        position + 1,
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
    const nodesListPosition = Array.from(newNodePosition, (cur) => cur - 1);
    newNodePosition = new Set(nodesListPosition as Array<NodePosition>);
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
  tranverseNode(rootNode, (curNode, _, exitTraversal) => {
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
  isBoundAllow?: boolean
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

  if (isBoundAllow) {
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

export function guardNodeReveal<T, Node extends NodeReference<T>>(
  traversalFn: LinkTraversalFn<T>
) {
  return function (node: Node, position: number, stopTraversal: () => void) {
    return void traversalFn(node.data, position, stopTraversal);
  };
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
  mapper: (fn: LinkListMapperFn<LinkedList>) => LinkedList
) {
  function removeDepValue(deps: any[]) {
    return slice(deps, 0, -1);
  }
  return createImmutableAction(linkedList, function (methodKey, dependencies) {
    const clone = mapper((v) => v);
    ((clone as any)[methodKey] as Fun)(removeDepValue(dependencies));
    return clone;
  });
}
