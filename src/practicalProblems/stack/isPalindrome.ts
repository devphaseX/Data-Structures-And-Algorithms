import createStack from '../../data_structure/stack/index.js';
import { iterableLoop } from '../../util/index.js';

function isPalindrome(value: string) {
  let surrogateSupportValue: Array<string> = [];
  const inverseCharStack = createStack<string>((push) => {
    iterableLoop<string>(value, (item) => {
      push(item);
      surrogateSupportValue.push(item);
    });
    return true;
  });
  let isInverselySame = true;

  inverseCharStack.flush((char, index) => {
    isInverselySame =
      char !== surrogateSupportValue[index - surrogateSupportValue.length];
    if (isInverselySame) throw void 0;
  });

  return isInverselySame;
}

export default isPalindrome;
