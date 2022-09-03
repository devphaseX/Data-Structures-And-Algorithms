import createStack from '../../data_structure/stack/index';
import {
  NumericExpression,
  extractOperand,
  parseTokenAsOperator,
  isStackOperatorPrioritied,
  isExpressionLenientlySame,
  ensureSymbolExpresssionUnqiue,
  supportExpression,
} from './sharedUtil';

type ParsedType = 'operand' | 'operator' | null;

function convertInfixToPostFixForm(
  expression: string,
  expressionExtension?: Array<NumericExpression>
) {
  const tokenStack = createStack<NumericExpression>(null);
  let postFixForm = '';
  let lastParsedType: ParsedType = null;

  const expressionSymbol = expressionExtension
    ? ensureSymbolExpresssionUnqiue(expressionExtension, supportExpression)
    : supportExpression;

  while (expression) {
    const leftParsedOperandInfo = extractOperand(expression);
    if (
      leftParsedOperandInfo &&
      (!lastParsedType || lastParsedType === 'operator')
    ) {
      postFixForm += leftParsedOperandInfo.operand;
      expression = leftParsedOperandInfo.rest;
    } else if (!lastParsedType || lastParsedType === 'operand') {
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

      if (!tokenStack.peek()) tokenStack.push(parsedOperatorSymbol);
      else {
        let lastStackedOperator: NumericExpression | null = null;
        while (parsedOperatorSymbol && tokenStack.size) {
          lastStackedOperator = tokenStack.peek()!;

          if (
            isStackOperatorPrioritied(lastStackedOperator, parsedOperatorSymbol)
          ) {
            postFixForm += lastStackedOperator.operator;
            tokenStack.pop();
          } else if (
            isExpressionLenientlySame(
              lastStackedOperator,
              parsedOperatorSymbol
            ) ||
            parsedOperatorSymbol.priority > lastStackedOperator.priority
          ) {
            tokenStack.push(parsedOperatorSymbol);
            parsedOperatorSymbol = null;
          } else {
            throw new TypeError(
              'Invalid operator type, provided an invalid associativity group.'
            );
          }
        }
        expression = parsedOperatorInfo.rest;
      }
    } else {
      if (lastParsedType !== 'operator')
        throw new TypeError(
          'Multiple operand followup, An operand can be either precedent by an operator or follow after an operator'
        );
    }
  }

  return postFixForm;
}

export { convertInfixToPostFixForm };
