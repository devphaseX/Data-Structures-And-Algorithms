import type { Stack } from '../../data_structure/stack/index';
import createStack from '../../data_structure/stack/index';

function reverseStack<T>(stack: Stack<T>, isMutable: true): Stack<T>;
function reverseStack<T>(stack: Stack<T>): void;
function reverseStack<T>(
  stack: Stack<T>,
  isMutable?: boolean
): Stack<T> | void {
  if (isMutable) return _reverseStack(stack);
  const immutableStack = createStack<T>((push) => {
    stack.forEach((item) => {
      push(item);
    });
    return true;
  });

  _reverseStack(immutableStack);
  return immutableStack;
}

function insertAtBottom(stack: Stack<any>, data: any) {
  if (stack.isEmpty()) {
    return stack.push(data);
  }

  let temp = stack.pop();
  insertAtBottom(stack, temp);
  stack.push(temp);
}

function _reverseStack<T>(stack: Stack<T>): void {
  if (stack.isEmpty()) return;
  const data = stack.pop();
  _reverseStack(stack);
  insertAtBottom(stack, data);
}

export default reverseStack;
