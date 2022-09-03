import { NodeReference } from './../../data_structure/linkedList/type';

function isLinkPalindrome(link: NodeReference<number>) {
  type Node = typeof link;
  const nodeInListFrom: Array<Node> = [];
  let currentLink: Node | null = link;
  do {
    nodeInListFrom.push(currentLink);
  } while ((currentLink = currentLink.next));

  let reverseNode;
  currentLink = link;
  while ((reverseNode = nodeInListFrom.pop())) {
    if (currentLink.data !== reverseNode.data) return false;
  }
  return true;
}

export default isLinkPalindrome;
