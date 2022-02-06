interface BinaryEvaluator {
  (x: number, y: number): number;
}

interface OperatorRank {
  associativity: Associativity;
  precedence: number;
  expressionEvaluator: BinaryEvaluator;
}

type Associativity = 'ltr' | 'rtl';
export type OperatorSymbol = '+' | '-' | '/' | '*' | '**' | '^' | '()';

function createOperatorRank(
  type: OperatorSymbol,
  precedence: number,
  associativity: Associativity
): [OperatorSymbol, OperatorRank] {
  return [
    type,
    { associativity, precedence, expressionEvaluator: evaluateOperator(type) },
  ];
}

function evaluateOperator(type: OperatorSymbol) {
  return function (x: number, y: number) {
    switch (type) {
      case '()': {
        return x ?? y;
      }

      case '^': {
        return x ^ y;
      }

      case '*': {
        return x * y;
      }

      case '/': {
        return x / y;
      }

      case '+': {
        return x + y;
      }

      case '-': {
        return x - y;
      }
      default: {
        throw new TypeError('Unknown operator');
      }
    }
  };
}

export const operatorMap = new Map<OperatorSymbol, OperatorRank>([
  createOperatorRank('()', 4, 'ltr'),
  createOperatorRank('^', 4, 'rtl'),
  createOperatorRank('*', 3, 'rtl'),
  createOperatorRank('/', 3, 'rtl'),
  createOperatorRank('+', 2, 'rtl'),
  createOperatorRank('-', 2, 'rtl'),
]);

const OperatorSplitPattern = new RegExp(
  `[${Array.from(operatorMap.values()).join('|')}]`,
  'g'
);

export function getOperand(expression: string) {
  return expression.split(OperatorSplitPattern);
}
