import { useCallback, useEffect, useReducer } from 'react';

import { calculate } from './api/client';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { calculatorReducer, initialState, type CalculatorAction } from './state/calculatorReducer';

const KEY_ACTIONS: Record<string, CalculatorAction> = {
  '+': { type: 'OPERATOR', operator: '+' },
  '-': { type: 'OPERATOR', operator: '-' },
  '*': { type: 'OPERATOR', operator: '*' },
  '/': { type: 'OPERATOR', operator: '/' },
  '(': { type: 'PAREN', paren: '(' },
  ')': { type: 'PAREN', paren: ')' },
  '.': { type: 'DOT' },
  '=': { type: 'EQUALS' },
  Enter: { type: 'EQUALS' },
  Backspace: { type: 'BACKSPACE' },
  Escape: { type: 'CLEAR' },
  Delete: { type: 'CLEAR' },
};

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['0–9'], label: 'digits' },
  { keys: ['+', '-', '*', '/'], label: 'operators' },
  { keys: ['(', ')'], label: 'parentheses' },
  { keys: ['Enter', '='], label: 'calculate' },
  { keys: ['Backspace'], label: 'delete' },
  { keys: ['Esc'], label: 'clear' },
];

function actionForKey(key: string): CalculatorAction | null {
  if (/^[0-9]$/.test(key)) return { type: 'DIGIT', digit: key };
  return KEY_ACTIONS[key] ?? null;
}

export default function App() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const { expression, status } = state;

  useEffect(() => {
    if (status !== 'calculating') return;
    let cancelled = false;
    calculate(expression).then((outcome) => {
      if (cancelled) return;
      if (outcome.ok) {
        dispatch({ type: 'RESULT_OK', result: outcome.result });
      } else {
        const { message, position } = outcome.error;
        dispatch({ type: 'RESULT_ERR', error: { message, position, retryable: outcome.retryable } });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [status, expression]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const onButton = (event.target as HTMLElement | null)?.tagName === 'BUTTON';
      if (onButton && (event.key === 'Enter' || event.key === ' ')) return;
      const action = actionForKey(event.key);
      if (!action) return;
      event.preventDefault();
      dispatch(action);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const onAction = useCallback((action: CalculatorAction) => dispatch(action), []);
  const canRetry = state.status === 'error' && state.error?.retryable === true;

  return (
    <main className="calculator">
      <h1 className="calculator__title">Calculator</h1>
      <Display
        expression={state.expression}
        status={state.status}
        result={state.result}
        error={state.error}
      />
      {canRetry && (
        <button type="button" className="retry" onClick={() => dispatch({ type: 'EQUALS' })}>
          Retry
        </button>
      )}
      <Keypad onAction={onAction} />
      <section className="hint" aria-label="Keyboard shortcuts">
        <h2 className="hint__title">Keyboard</h2>
        <ul className="hint__list">
          {SHORTCUTS.map(({ keys, label }) => (
            <li key={label} className="hint__item">
              <span className="hint__keys">
                {keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
