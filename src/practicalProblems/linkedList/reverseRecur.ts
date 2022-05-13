import { NodeReference } from '../../data_structure/linkedList/type.js';

function reverseRecur<LinkNode extends NodeReference<any>>(
  linkNode: LinkNode
): null | LinkNode {
  if (!(linkNode && linkNode.next)) {
    return linkNode ?? null;
  }

  const nextNode = linkNode.next;
  linkNode.next = null;
  const reverseNode = reverseRecur(nextNode);

  nextNode.next = linkNode;

  return reverseNode as LinkNode;
}

export default reverseRecur;
