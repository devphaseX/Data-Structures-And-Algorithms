import { Result } from './../../util/index';

type OperatorType = 'unary' | 'binary' | 'tertiary';
interface Operator<Sym, Type extends OperatorType> {
  symbol: Sym;
}

interface UnaryOperator<S> extends Operator<S, 'unary'> {
  computer(value: any): Result<number>;
}

interface BinaryOperator<S> extends Operator<S, 'binary'> {
  computer(x: number, y: number): Result<number>;
}

interface TertiaryOperator<S> extends Operator<S, 'tertiary'> {
  computer<Then, Else>(cond: () => true, satisfied: Then, fallback: Else): Then;
  computer<Then, Else>(
    cond: () => false,
    satisfied: Then,
    fallback: Else
  ): Else;
  computer<Then, Else>(
    cond: () => boolean,
    satisfied: Then,
    fallback: Else
  ): Then | Else;
}
