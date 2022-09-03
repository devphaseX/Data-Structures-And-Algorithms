import createStack from '../../data_structure/stack/index';
import {
  ensureSymbolExpresssionUnqiue,
  extractOperand,
  isExpressionLenientlySame,
  isStackOperatorPrioritied,
  NumericExpression,
  parseTokenAsOperator,
  supportExpression,
} from './sharedUtil';

function evaluateInfix(
  expression: string,
  expressionExtension?: Array<NumericExpression>
) {
  const operandStack = createStack<number>(null);
  const operatorStack = createStack<NumericExpression>(null);

  const expressionSymbol = expressionExtension
    ? ensureSymbolExpresssionUnqiue(expressionExtension, supportExpression)
    : supportExpression;

  while (expression) {
    const leftParsedOperandInfo = extractOperand(expression);
    if (leftParsedOperandInfo) {
      operandStack.push(+leftParsedOperandInfo.operand);
      expression = leftParsedOperandInfo.rest;
    } else {
      const parsedOperatorInfo = parseTokenAsOperator(
        expression,
        expressionSymbol
      );

      if (!parsedOperatorInfo) {
        throw new TypeError(
          `Support for the preceeding operator isn't found, 
          you can provide a custom support operator using the {expressionExtension parameter}`
        );
      }
      let parsedOperatorSymbol: NumericExpression | null =
        parsedOperatorInfo.operator;

      if (!operatorStack.peek()) operatorStack.push(parsedOperatorSymbol);
      else {
        let lastStackedOperator: NumericExpression | null = null;
        while (parsedOperatorSymbol && operatorStack.size) {
          lastStackedOperator = operatorStack.peek()!;

          if (
            isStackOperatorPrioritied(lastStackedOperator, parsedOperatorSymbol)
          ) {
            const prevStackSize = operandStack.size;
            const nextOperand = lastStackedOperator.computer(operandStack);
            if (prevStackSize === operandStack.size) throw new TypeError();
            operandStack.push(nextOperand);
          } else if (
            isExpressionLenientlySame(
              lastStackedOperator,
              parsedOperatorSymbol
            ) ||
            parsedOperatorSymbol.priority > lastStackedOperator.priority
          ) {
            operatorStack.push(parsedOperatorSymbol);
            parsedOperatorSymbol = null;
          } else {
            throw new TypeError(
              'Invalid operator type, provided an invalid associativity group.'
            );
          }
        }
        expression = parsedOperatorInfo.rest;
      }
    }
  }

  if (operandStack.size > 1) throw new Error();
  return operandStack.pop();
}

export { evaluateInfix };
