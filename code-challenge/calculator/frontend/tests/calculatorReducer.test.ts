import {
  calculatorReducer,
  initialState,
  type CalculatorAction,
  type CalculatorState,
  type Operator,
} from '../src/state/calculatorReducer';

const run = (actions: CalculatorAction[], start: CalculatorState = initialState) =>
  actions.reduce(calculatorReducer, start);
const digit = (d: string): CalculatorAction => ({ type: 'DIGIT', digit: d });
const op = (operator: Operator): CalculatorAction => ({ type: 'OPERATOR', operator });
const paren = (p: '(' | ')'): CalculatorAction => ({ type: 'PAREN', paren: p });
const dot: CalculatorAction = { type: 'DOT' };
const equals: CalculatorAction = { type: 'EQUALS' };

const shown = (result: string) =>
  run([digit('2'), op('+'), digit('3'), equals, { type: 'RESULT_OK', result }]);

describe('calculatorReducer', () => {
  it('builds an expression from keys', () => {
    const keys = [digit('2'), op('+'), digit('3'), op('*'), paren('('), digit('4'), op('-'), digit('1'), paren(')')];
    expect(run(keys).expression).toBe('2+3*(4-1)');
  });

  it('ignores a second dot in the same number', () => {
    expect(run([digit('1'), dot, digit('5'), dot]).expression).toBe('1.5');
  });

  it('allows a dot in the next number and prefixes a bare dot with zero', () => {
    expect(run([digit('1'), dot, digit('5'), op('+'), dot, digit('5')]).expression).toBe('1.5+0.5');
    expect(run([dot]).expression).toBe('0.');
  });

  it('replaces an operator typed after an operator', () => {
    expect(run([digit('2'), op('+'), op('*')]).expression).toBe('2*');
  });

  it('allows unary minus after multiply, divide or an open parenthesis', () => {
    expect(run([digit('2'), op('*'), op('-'), digit('3')]).expression).toBe('2*-3');
    expect(run([paren('('), op('-'), digit('3'), paren(')')]).expression).toBe('(-3)');
  });

  it('accepts only minus as a leading operator', () => {
    expect(run([op('+')]).expression).toBe('');
    expect(run([op('-'), digit('3')]).expression).toBe('-3');
  });

  it('refuses a closing parenthesis with nothing to close', () => {
    expect(run([digit('2'), paren(')')]).expression).toBe('2');
    expect(run([paren('('), paren(')')]).expression).toBe('(');
  });

  it('starts a new expression when a digit follows a result', () => {
    const state = shown('5');
    expect(state.status).toBe('result');
    expect(run([digit('7')], state)).toMatchObject({ expression: '7', status: 'typing', result: null });
  });

  it('chains an operator onto the result', () => {
    expect(run([op('*'), digit('2')], shown('5')).expression).toBe('5*2');
  });

  it('does nothing on equals with an empty expression', () => {
    expect(run([equals])).toBe(initialState);
  });

  it('ignores results that arrive when not calculating', () => {
    const typed = run([digit('1')]);
    expect(calculatorReducer(typed, { type: 'RESULT_OK', result: '9' })).toBe(typed);
  });

  it('backspace edits, clear resets, backspace after a result clears', () => {
    expect(run([digit('1'), digit('2'), { type: 'BACKSPACE' }]).expression).toBe('1');
    expect(run([digit('1'), { type: 'CLEAR' }])).toBe(initialState);
    expect(run([{ type: 'BACKSPACE' }], shown('5'))).toBe(initialState);
  });

  it('keeps the expression editable after an error', () => {
    const error = { message: 'Cannot divide by zero.', position: 1, retryable: false };
    const failed = run([digit('1'), op('/'), digit('0'), equals, { type: 'RESULT_ERR', error }]);
    expect(failed).toMatchObject({ status: 'error', error });
    const edited = run([{ type: 'BACKSPACE' }, digit('2')], failed);
    expect(edited).toMatchObject({ expression: '1/2', status: 'typing', error: null });
  });
});
