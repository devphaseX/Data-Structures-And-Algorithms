import { compare } from './../../util/index';
import { NodeReference } from '../../data_structure/linkedList/type.js';
import {
  detectCircularNode,
  tranverseNode,
} from '../../data_structure/linkedList/util';
import { getListLastItem } from '../../util/index';

const { equal } = compare;

function findLinkIntersectionUsingMembership<Node extends NodeReference<any>>(
  firstNode: Node,
  secondNode: Node
) {
  let currentTraversedFirstNode = firstNode as Node | null;
  const traversedFirstNodeMarkStore = new Set<Node>();

  while (currentTraversedFirstNode) {
    if (traversedFirstNodeMarkStore.has(currentTraversedFirstNode)) break;
    traversedFirstNodeMarkStore.add(currentTraversedFirstNode);
    if (!currentTraversedFirstNode.next) break;

    currentTraversedFirstNode = currentTraversedFirstNode.next as Node;
  }

  let currentTraversedSecondNode = secondNode;
  while (secondNode) {
    if (traversedFirstNodeMarkStore.has(currentTraversedSecondNode)) {
      return currentTraversedFirstNode;
    }

    if (equal.check(currentTraversedFirstNode, currentTraversedSecondNode)) {
      break;
    }

    currentTraversedSecondNode = currentTraversedSecondNode.next as Node;
  }

  return null;
}

type LinkStack<Node> = Array<Node> & { identities: Set<Node> };

function findLinkIntersectionUsingStack<Node extends NodeReference<any>>(
  firstNode: Node,
  secondNode: Node
) {
  const stackOne = mapLinkNodeToStack(firstNode);
  const stackTwo = mapLinkNodeToStack(secondNode);

  function mapLinkNodeToStack(node: Node) {
    const stack: LinkStack<Node> = [] as any;
    stack.identities = new Set();
    tranverseNode(
      node,
      (currentNode, _, { abortTarversal }) => {
        if (stack.identities.has(currentNode)) {
          return abortTarversal();
        }

        stack.identities.add(currentNode);
        stack.push(currentNode);
      },
      {
        isCircular:
          '_type_' in firstNode ? detectCircularNode(firstNode) : true,
      }
    );
    return stack;
  }

  while (equal.check(getListLastItem(stackOne), getListLastItem(stackTwo))) {
    stackOne.pop();
    stackTwo.pop();
  }

  return getListLastItem(stackOne)?.data ?? null;
}

export {
  findLinkIntersectionUsingStack,
  findLinkIntersectionUsingMembership as findLinkIntersection,
};
