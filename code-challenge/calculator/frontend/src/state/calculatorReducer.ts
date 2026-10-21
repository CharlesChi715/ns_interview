export type Status = 'idle' | 'typing' | 'calculating' | 'result' | 'error';
export type Operator = '+' | '-' | '*' | '/';

export interface CalculatorError {
  message: string;
  position?: number | null;
  retryable: boolean;
}

export interface CalculatorState {
  expression: string;
  status: Status;
  result: string | null;
  error: CalculatorError | null;
}

export type CalculatorAction =
  | { type: 'DIGIT'; digit: string }
  | { type: 'DOT' }
  | { type: 'OPERATOR'; operator: Operator }
  | { type: 'PAREN'; paren: '(' | ')' }
  | { type: 'BACKSPACE' }
  | { type: 'CLEAR' }
  | { type: 'EQUALS' }
  | { type: 'RESULT_OK'; result: string }
  | { type: 'RESULT_ERR'; error: CalculatorError };

export const initialState: CalculatorState = {
  expression: '',
  status: 'idle',
  result: null,
  error: null,
};

const OPERATORS = '+-*/';

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case 'DIGIT':
      return typing(state, freshOrCurrent(state) + action.digit);

    case 'DOT': {
      const base = freshOrCurrent(state);
      if (base.at(-1) === ')') return state;
      const number = currentNumber(base);
      if (number.includes('.')) return state;
      return typing(state, base + (number === '' ? '0.' : '.'));
    }

    case 'OPERATOR': {
      const base = state.status === 'result' && state.result !== null ? state.result : state.expression;
      const last = base.at(-1);
      if (last === undefined || last === '(') {
        return action.operator === '-' ? typing(state, base + '-') : state;
      }
      if (OPERATORS.includes(last)) {
        const unary = action.operator === '-' && (last === '*' || last === '/');
        return typing(state, unary ? base + '-' : base.slice(0, -1) + action.operator);
      }
      return typing(state, base + action.operator);
    }

    case 'PAREN': {
      const base = freshOrCurrent(state);
      if (action.paren === '(') return typing(state, base + '(');
      const last = base.at(-1);
      const open = count(base, '(') - count(base, ')');
      if (open <= 0 || last === undefined || last === '(' || OPERATORS.includes(last)) return state;
      return typing(state, base + ')');
    }

    case 'BACKSPACE':
      if (state.status === 'result') return initialState;
      return typing(state, state.expression.slice(0, -1));

    case 'CLEAR':
      return initialState;

    case 'EQUALS':
      if (state.expression === '' || state.status === 'calculating') return state;
      return { ...state, status: 'calculating', error: null };

    case 'RESULT_OK':
      if (state.status !== 'calculating') return state;
      return { ...state, status: 'result', result: action.result, error: null };

    case 'RESULT_ERR':
      if (state.status !== 'calculating') return state;
      return { ...state, status: 'error', result: null, error: action.error };
  }
}

function freshOrCurrent(state: CalculatorState): string {
  return state.status === 'result' ? '' : state.expression;
}

function typing(state: CalculatorState, expression: string): CalculatorState {
  return {
    ...state,
    expression,
    status: expression === '' ? 'idle' : 'typing',
    result: null,
    error: null,
  };
}

function currentNumber(expression: string): string {
  return /[0-9.]*$/.exec(expression)?.[0] ?? '';
}

function count(text: string, char: string): number {
  return text.split(char).length - 1;
}
