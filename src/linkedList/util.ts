import { map, slice, unwrappedAccessorToDataProperty } from "../util/index.js";
import {
  DoubleReferenceNode,
  DoublyNodeOption,
  LinkType,
  Node,
  NodeOption,
  NodePosition,
  NodeReference,
  SingleDirectedNode,
  SingleReferenceNode,
  SinglyLinkedList,
  SinglyNodeOption,
} from "./type";

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

export type LinkOption = {
  direction: "next" | "prev";
  isCircular: boolean;
};

type TranversalFn<LinkNode> = (
  node: LinkNode,
  position: number,
  abortTraversel: () => void
) => void;

interface TranverseLink {
  <LinkNode extends Node<any>>(
    linkedNode: LinkNode,
    traversal: TranversalFn<LinkNode>,
    initialNodePosition?: number,
    linkOptions?: Partial<LinkOption>
  ): void;
}
let tranverseNode: TranverseLink;

{
  const defaulLinkOptions: LinkOption = {
    direction: "next",
    isCircular: false,
  };

  tranverseNode = function tranverseLink<LinkNode extends Node<any>>(
    linkedNode: LinkNode,
    traversal: TranversalFn<LinkNode>,
    initialNodePosition?: number,
    linkOptions?: Partial<LinkOption>
  ) {
    const direction =
      (linkOptions && linkOptions.direction) || defaulLinkOptions.direction;
    const isCircular =
      (linkOptions && linkOptions.isCircular) || defaulLinkOptions.isCircular;

    const startNode = linkedNode;

    function traverseNodes(
      node: LinkNode | null,
      direction: "next" | "prev",
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

      traversal(node, position, () => {
        isTraverseAbort = true;
      });

      if (isTraverseAbort) {
        return;
      }

      traversedNodes.add(node);

      if (nextNode !== node.next) {
        throw new TypeError(
          "Mutation of linked node during traversal is void, to prevent infinite loop."
        );
      }

      return traverseNodes(
        node[direction as keyof Node<any>],
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

type CustomFunction = (...args: any[]) => void;

export function createImmutableStructure<T>(
  args: Array<CustomFunction>,
  mapNode: <U>(fn: (value: T) => U, mutable?: boolean) => SinglyLinkedList<U>
) {
  return map(args, function addImmutableOnAllow(fn) {
    if (!fn.name) {
      throw new TypeError();
    }
    return [
      fn.name,
      function decideImmutable(...args: any[]) {
        const immutableArg = args[args.length - 1] as boolean;
        if (typeof immutableArg === "boolean" && immutableArg) {
          return immutableOperation();
          function immutableOperation() {
            const clone = mapNode((v) => v);
            args.pop();

            type SinglyOperationKey = keyof typeof clone;
            const mutableMethod = clone[
              fn.name as SinglyOperationKey
            ] as CustomFunction;
            if (typeof mutableMethod === "function") {
              mutableMethod(...args);
            }
            return clone;
          }
        }
        return (<CustomFunction>fn)(...args);
      },
    ];
  });
}

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
  node: SingleDirectedNode<T>,
  isCircular?: boolean
) {
  let rootNode = isCircular ? node : null;
  tranverseNode(node, (curNode, _, exitTraversal) => {
    if (rootNode && rootNode === curNode) {
      return void exitTraversal();
    }
    if (curNode.next && curNode.next.next === null) {
      curNode.next = null;
      exitTraversal();
    }
  });
}

export function createLinkNode<T>(
  nodeOptions: SinglyNodeOption<T>
): SingleReferenceNode<T>;
export function createLinkNode<T>(
  nodeOptions: DoublyNodeOption<T>
): DoubleReferenceNode<T>;

export function createLinkNode<T>(nodeOptions: NodeOption<T>): NodeReference<T>;
export function createLinkNode<T>(nodeOptions: NodeOption<T>) {
  const { initialData, ...nodeOption } = nodeOptions;

  if (!Array.isArray(initialData)) {
    return createNode(initialData, nodeOption);
  }

  let nodes = initialData.map((data) =>
    createLinkNode({ initialData: data, ...nodeOption })
  );
  if (initialData.length === 0) return null;

  return connectLinkNodes(nodes, nodeOption.type, nodeOption.isCircular);
}

function connectLinkNodes<T>(
  refs: Array<NodeReference<T>>,
  type: LinkType,
  isCircular: boolean
): NodeReference<T> {
  let root = refs[0];
  let last = root;
  for (let sibling of slice(refs, 1)) {
    last.next = sibling;
    if (isLinkDouble(type, sibling) && isLinkDouble(type, last)) {
      sibling.prev = last;
    }
    last = sibling;
  }

  if (isCircular) {
    last.next = root;
    if (isLinkDouble(type, last) && isLinkDouble(type, root)) {
      root.prev = last;
    }
  }
  return root;
}

export function isLinkDouble<T>(
  type: LinkType,
  node: NodeReference<T>
): node is DoubleReferenceNode<T> {
  return type === "double" && "prev" in node;
}

function createNode<T>(
  initial: T,
  nodeOption: Omit<NodeOption<T>, "initialData">
): DoubleReferenceNode<T> | SingleReferenceNode<T> {
  if (nodeOption.type === "single") {
    return unwrappedAccessorToDataProperty(
      createSingleNode(initial, nodeOption.isCircular)
    );
  } else {
    return unwrappedAccessorToDataProperty(
      createDoubleNode(initial, nodeOption.isCircular)
    );
  }
}

export function getNodeTail<Node extends NodeReference<any>>(
  node: Node,
  options?: LinkOption
) {
  let lastNode = node;
  tranverseNode(
    node,
    (curNode) => {
      if (!curNode.next) {
        lastNode = curNode;
      }
    },
    1,
    options
  );
  return lastNode;
}
