import createStack from '../../data_structure/stack/index.js';
import { createUniqueStructure, iterableLoop } from '../../util/index';

type SymbolSignType = 'open' | 'close';

interface BalancedSymbol {
  value: string;
  type: SymbolSignType;
}

interface OpenBalancedSymbol extends BalancedSymbol {
  type: 'open';
  closeSymbol?: CloseBalancedSymbol;
}

interface CloseBalancedSymbol extends BalancedSymbol {
  type: 'close';
  openSymbol?: OpenBalancedSymbol;
}

type SymbolDelimiter = { left: string; right: string };

interface BalancedLink {
  leftBalanced: OpenBalancedSymbol;
  rightBalanced: CloseBalancedSymbol;
}

function createOpenBalancedSymbol(
  value: string,
  closeSymbol?: CloseBalancedSymbol
): OpenBalancedSymbol {
  return { type: 'open', value, closeSymbol };
}

function createCloseBalancedSymbol(
  value: string,
  openSymbol?: OpenBalancedSymbol
): CloseBalancedSymbol {
  return { type: 'close', value, openSymbol };
}

function createBalancedLink(
  leftBalanced: OpenBalancedSymbol,
  rightBalanced: CloseBalancedSymbol
): BalancedLink {
  leftBalanced.closeSymbol = rightBalanced;
  rightBalanced.openSymbol = leftBalanced;
  return { leftBalanced, rightBalanced };
}

function createBalancedSymbol(pair: SymbolDelimiter) {
  return createBalancedLink(
    createOpenBalancedSymbol(pair.left),
    createCloseBalancedSymbol(pair.right)
  );
}

function findBalanceSymbol(link: Array<BalancedLink>, token: string) {
  let balancedSymbol: BalancedSymbol | null = null;

  iterableLoop<BalancedLink>(link, (symLink, _, { breakLoop }) => {
    const { leftBalanced, rightBalanced } = symLink;
    if (leftBalanced.value === token)
      return balancedSymbol === leftBalanced && breakLoop();
    else if (rightBalanced.value === token)
      return balancedSymbol === rightBalanced && breakLoop();
  });

  return balancedSymbol as OpenBalancedSymbol | CloseBalancedSymbol | null;
}

const symbolDelimiters: Array<SymbolDelimiter> = [
  { left: '{', right: '}' },
  { left: '[', right: ']' },
  { left: '(', right: ')' },
];

const defaultBalancedSymbol = symbolDelimiters.map(createBalancedSymbol);

function mergeBalanceTable(
  tableOne: Array<BalancedLink>,
  tableTwo: Array<BalancedLink>
) {
  return createUniqueStructure(tableOne.concat(tableTwo), (oldStructure) => {
    const uniqueList: Array<BalancedLink> = [];
    return {
      structure: uniqueList,
      push: uniqueList.push.bind(uniqueList),
      checkExist: ({
        leftBalanced: { value: replaceLeftSymbol },
        rightBalanced: { value: replaceRightSymbol },
      }: BalancedLink) =>
        !!oldStructure.find(
          ({
            leftBalanced: { value: leftOldSymbol },
            rightBalanced: { value: rightOldSymbol },
          }) =>
            replaceLeftSymbol === leftOldSymbol &&
            replaceRightSymbol === rightOldSymbol
        ),
    };
  });
}

type BalancedOption = { merge: boolean };

function ensureBalanceTableIsAvailable(
  balanceTable?: Array<BalancedLink>,
  option?: BalancedOption
) {
  let isMergeAllowed = option && option.merge;
  const hasBalanceTable = balanceTable !== undefined;

  if (hasBalanceTable) {
    return isMergeAllowed
      ? mergeBalanceTable(defaultBalancedSymbol, balanceTable)
      : balanceTable;
  }

  return defaultBalancedSymbol;
}

function checkSymbolBalance(
  payload: string,
  balanceTable?: Array<BalancedLink>,
  option?: BalancedOption
) {
  const balancedStack = createStack<BalancedSymbol>(null);
  balanceTable = ensureBalanceTableIsAvailable(balanceTable, option)!;
  let isBalanced = false;
  iterableLoop<string>(payload, (token, _, { breakLoop }) => {
    const balancedPair = findBalanceSymbol(balanceTable!, token);
    if (!balancedPair) return;

    if (balancedPair.type === 'open') return balancedStack.push(balancedPair);
    else {
      const lastPair = balancedStack.peek();
      if (!lastPair || lastPair !== balancedPair.openSymbol) {
        return breakLoop();
      }
      balancedStack.pop();
    }
  });
  return isBalanced;
}

export default checkSymbolBalance;
