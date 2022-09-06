import { Stack } from '../../data_structure/stack/index';
import {
  createUniqueStructure,
  DIGIT_PATTERN,
  isDigit,
} from '../../util/index';

type ExpressionType = 'unary' | 'binary' | 'tertiary';
type Token = string;
type Priority = number;
type Associativity = 'rtl' | 'ltr';

type OperandStack = Stack<number>;
interface NumericExpression {
  type: ExpressionType;
  priority: Priority;
  associativity: Associativity;
  operator: Token;
  computer: (stack: OperandStack, ...rest: any) => number;
}

type UnaryComputer = (stack: OperandStack) => number;
type BinaryComputer = (stack: OperandStack) => number;
type TertiaryComputer = (
  stack: OperandStack,
  check: boolean | (() => boolean),
  then: number,
  fallbak: number
) => number;
interface UnaryExpression extends NumericExpression {
  type: 'unary';
  computer: UnaryComputer;
}

interface BinaryExpression extends NumericExpression {
  type: 'binary';
  computer: BinaryComputer;
}

interface TertiaryExpression extends NumericExpression {
  type: 'tertiary';
  computer: TertiaryComputer;
}

function createUnary(
  operator: Token,
  priority: Priority,
  associativity: Associativity,
  computer: UnaryComputer
): UnaryExpression {
  return { type: 'unary', priority, associativity, operator, computer };
}

function createBinary(
  operator: Token,
  priority: Priority,
  associativity: Associativity,
  computer: BinaryComputer
): BinaryExpression {
  return { type: 'binary', priority, associativity, operator, computer };
}

function createTertiary(
  operator: Token,
  priority: Priority,
  associativity: Associativity,
  computer: TertiaryComputer
): TertiaryExpression {
  return {
    type: 'tertiary',
    priority,
    associativity,
    operator,
    computer,
  };
}

const ensureSymbolExpresssionUnqiue = (
  ...expressions: Array<NumericExpression[]>
) =>
  createUniqueStructure(
    expressions.flat(Infinity) as Array<NumericExpression>,
    (oldStructure) => {
      const uniqueStructure: Array<NumericExpression> = [];

      return {
        structure: uniqueStructure,
        push: (value: NumericExpression) => uniqueStructure.push(value),
        checkExist: (value: NumericExpression) =>
          !!oldStructure.find((item) => item.operator === value.operator),
      };
    }
  );

const getSupportUnary = () => [
  createUnary('++', 4, 'rtl', (stack) => stack.pop() - 1),
  createBinary('--', 4, 'ltr', (stack) => stack.pop() - 1),
];

const getSupportBinary = () => [
  createBinary('+', 3, 'ltr', (stack) => stack.pop() + stack.pop()),
  createBinary('-', 3, 'ltr', (stack) => stack.pop() - stack.pop()),
  createBinary('/', 5, 'ltr', (stack) => stack.pop() / stack.pop()),
  createBinary('*', 5, 'ltr', (stack) => stack.pop() + stack.pop()),
  createBinary('%', 5, 'ltr', (stack) => stack.pop() % stack.pop()),
  createBinary('**', 6, 'rtl', (stack) => stack.pop() ** stack.pop()),
];

function parseTokenAsOperator(
  fullExp: string,
  tokens: Array<NumericExpression>
) {
  const foundTokens = tokens.filter((token) =>
    fullExp.toLocaleLowerCase().startsWith(token.operator.toLocaleLowerCase())
  );

  if (!foundTokens.length) return null;
  let operatorBalanceSym = foundTokens[0];

  return {
    operator: operatorBalanceSym,
    rest: fullExp.slice(operatorBalanceSym.operator.length),
  };
}

const extractOperand = (expression: string) => {
  const matches = expression.match(new RegExp(`^${DIGIT_PATTERN.source}`));
  if (!matches) return null;

  return {
    operand: matches[0],
    index: matches.index,
    get rest() {
      return expression.slice(this.operand.length);
    },
  };
};

const isExpressionLenientlySame = (
  first: NumericExpression,
  second: NumericExpression
) => {
  return (
    first.priority === second.priority &&
    first.associativity === second.associativity
  );
};

const isStackOperatorPrioritied = (
  lastStackOp: NumericExpression,
  currentParsedOp: NumericExpression
) =>
  (isExpressionLenientlySame(lastStackOp, currentParsedOp) &&
    lastStackOp.associativity === 'ltr') ||
  currentParsedOp.priority < lastStackOp.priority;

const isTokenOperand = (value: Token) => isDigit(value);
const supportExpression = getSupportUnary().concat(getSupportBinary());

export type {
  BinaryComputer,
  BinaryExpression,
  ExpressionType,
  NumericExpression,
  TertiaryComputer,
  TertiaryExpression,
  UnaryComputer,
  UnaryExpression,
};

export {
  supportExpression,
  ensureSymbolExpresssionUnqiue,
  isStackOperatorPrioritied,
  isExpressionLenientlySame,
  parseTokenAsOperator,
  getSupportUnary,
  getSupportBinary,
  createUnary,
  createBinary,
  createTertiary,
  extractOperand,
  isTokenOperand,
};
