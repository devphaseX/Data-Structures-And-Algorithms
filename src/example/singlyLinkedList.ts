import { createSinglyLinkedList } from "../linkedList/index.js";
import { _chain } from "../util/index.js";

const singly = createSinglyLinkedList({ initialData: 1 });
singly.appendNode(2);

[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].forEach((num) => {
  singly.appendNode(num);
});

// singly.positionBaseRemoval(11);
const newSingly = singly.removeLastNode(true);
const another = singly.map((v) => ({ num: v }));

// console.log(singly);
console.log(
  _chain([1, 2, 3, 4])
    .map((id) => ({ [id]: Math.random() }))
    .push({ [5]: Math.random() })
    .shift()
    .unshift({ [1]: 1 })
    .value()
  // .value()
);
