import type { NodeReference } from '../../data_structure/linkedList/type';
import { isLinkShaped } from '../../data_structure/linkedList/util.js';

function detectLoopUsingMembership(linked: NodeReference<any>) {
  return !!findStartOfLoop(linked);
}

function detectLoopUsingFloydCycle(linked: NodeReference<any>) {
  let fastNode: NodeReference<any> | null = linked;
  let bNodePoint: NodeReference<any> | null = linked;

  while (fastNode !== null && bNodePoint !== null && fastNode.next) {
    fastNode = fastNode?.next?.next ?? null;
    bNodePoint = bNodePoint?.next ?? null;
    if (fastNode === bNodePoint) return true;
  }
  return false;
}

function findStartOfLoop<L extends NodeReference<any>>(linkedNode: L) {
  if (!isLinkShaped(linkedNode)) {
    throw new Error(
      'The object passed does not show any resemblance with a linkedNode implemented object.'
    );
  }
  let visitedNodes: Set<L> = new Set();
  let currentNode: L | null = linkedNode;
  let prevNode: L | null = null;

  while (currentNode) {
    if (visitedNodes.has(currentNode)) return prevNode;

    visitedNodes.add(currentNode);
    prevNode = currentNode;
    currentNode = currentNode.next as null | L;
  }

  return null;
}

function findLoopLength(linkedNode: NodeReference<any>): number {
  let fastPointer = linkedNode as NodeReference<any> | null;
  let slowPointer = fastPointer;

  while (fastPointer && slowPointer && fastPointer.next) {
    fastPointer = fastPointer.next.next;
    slowPointer = slowPointer.next;

    if (fastPointer === slowPointer) {
      break;
    }
  }

  let counter = 0;

  while (fastPointer) {
    fastPointer = fastPointer.next;
    counter++;
    if (fastPointer === slowPointer) {
      break;
    }
  }

  return counter;
}

export {
  detectLoopUsingFloydCycle,
  detectLoopUsingMembership,
  findStartOfLoop,
  findLoopLength,
};
