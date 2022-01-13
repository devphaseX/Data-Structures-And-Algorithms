import {
  sealObject,
  slice,
  unwrappedAccessorToDataProperty,
} from "../util/index.js";
import { CircularNode, DoubleDirectedNode, Node } from "./type.js";
export { createSinglyLinkedList } from "./singlyLinkedList.js";

type LinkType = "single" | "double";
type CircularNodeOption<CT extends LinkType> = {
  circularType: CT;
};

export function createNode<T, D extends LinkType>(
  data: T,
  options: CircularNodeOption<D>
): CircularNode<T, D extends "single" ? false : true>;

export function createNode<T, B extends boolean>(
  data: T,
  isDouble: B
): Node<T, B>;

export function createNode<T>(data: T): Node<T, false>;
export function createNode<T>(
  data: T,
  options?: CircularNodeOption<LinkType> | boolean
): Node<T> | CircularNode<T, boolean> {
  let node;
  if (options) {
    if (typeof options === "object") {
      switch (options.circularType) {
        case "single":
          node = createSingleNode(data, true);
          break;
        case "double":
          node = createDoubleNode(data, true);
          break;
      }
    }
  } else {
    node = createSingleNode(data);
  }

  return sealObject(unwrappedAccessorToDataProperty(node as any));
}

type NodeLinkType = { type: LinkType; isCircular: boolean };

function detectNodeType(option: CircularNodeOption<LinkType> | boolean) {
  const linktype =
    typeof option === "object"
      ? { type: option.circularType, isCircular: true }
      : { type: option === true ? "single" : "double", isCircular: false };
  return linktype as NodeLinkType;
}

export function createNodes<T, D extends LinkType>(
  data: Array<T>,
  options: CircularNodeOption<D>
): CircularNode<T, D extends "single" ? false : true>;

export function createNodes<T, B extends boolean>(
  data: Array<T>,
  isDouble: B
): Node<T, B>;

export function createNodes<T>(data: Array<T>): Node<T, false>;
export function createNodes<T>(
  data: Array<T>,
  options?: CircularNodeOption<LinkType> | boolean
): Node<T> | CircularNode<T, boolean> {
  const root = createNode(data[0], options as any);
  let lastCreatedNode = root;
  let linkedConnectType: NodeLinkType = { type: "single", isCircular: false };
  if (options) {
    linkedConnectType = detectNodeType(options);
  }
  for (let other of slice(data, 1)) {
    const newNode = createNode(other);
    switch (linkedConnectType.type) {
      case "single": {
        lastCreatedNode.next = newNode;
        break;
      }
      case "double": {
        let doubleLinkedNode = lastCreatedNode as DoubleDirectedNode<T>;
        doubleLinkedNode.next = newNode as DoubleDirectedNode<T>;
        (newNode as DoubleDirectedNode<T>).prev = doubleLinkedNode;
      }
    }
  }

  if (linkedConnectType.isCircular) {
    switch (linkedConnectType.type) {
      case "single": {
        lastCreatedNode.next = root;
        break;
      }

      case "double": {
        let doubleLinkedNode = lastCreatedNode as DoubleDirectedNode<T>;
        const doubleLinkRoot = root as DoubleDirectedNode<T>;
        doubleLinkRoot.prev = doubleLinkRoot;
        doubleLinkedNode.next = doubleLinkRoot;
      }
    }
  }
  return root;
}

function createSingleNode<T>(data: T, isCircular?: boolean) {
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

function createDoubleNode<T>(data: T, isCircular?: boolean) {
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

export type LinkOption<LinkNode extends Node<any, any>> = {
  direction: Exclude<keyof LinkNode, "data">;
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
    linkOptions?: Partial<LinkOption<LinkNode>>
  ): void;
}
let tranverseNode: TranverseLink;

{
  const defaulLinkOptions: LinkOption<Node<any>> = {
    direction: "next",
    isCircular: false,
  };

  tranverseNode = function tranverseLink<LinkNode extends Node<any>>(
    linkedNode: LinkNode,
    traversal: TranversalFn<LinkNode>,
    initialNodePosition?: number,
    linkOptions?: Partial<LinkOption<LinkNode>>
  ) {
    const direction =
      (linkOptions && linkOptions.direction) || defaulLinkOptions.direction;
    const isCircular =
      (linkOptions && linkOptions.isCircular) || defaulLinkOptions.isCircular;

    const startNode = linkedNode;

    function traverseNodes(
      rootNode: LinkNode,
      node: LinkNode | null,
      direction: "next" | "prev",
      isCircular: boolean,
      traversal: TranversalFn<LinkNode>,
      position: number,
      traversedNodes: WeakSet<LinkNode>
    ): void {
      if (node === null || (node.next === rootNode && isCircular)) {
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
        rootNode,
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
