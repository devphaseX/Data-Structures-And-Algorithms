const GENERIC_NODE = Symbol('generic_node');

interface GenericNode<V> {
  value: V;
  firstChild?: GenericNode<V>;
  nextSibling?: GenericNode<V>;
  [GENERIC_NODE]: true;
}

const createNode = <V>(value: V): GenericNode<V> => {
  return { value, [GENERIC_NODE]: true };
};

function insertChild<V>(
  node: GenericNode<V>,
  value: GenericNode<V> | V
): GenericNode<V> {
  value =
    value && typeof value === 'object' && GENERIC_NODE in value
      ? value
      : createNode(value);
  if (!node.firstChild) node.firstChild = value;

  let nextChild = node.firstChild;
  while (nextChild?.nextSibling) {
    nextChild = nextChild.nextSibling;
  }

  nextChild.nextSibling = value;

  return node;
}

export { createNode, insertChild };
export type { GenericNode };
