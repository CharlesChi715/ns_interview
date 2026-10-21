import type { CalculatorAction, Operator } from '../state/calculatorReducer';

interface Key {
  label: string;
  action: CalculatorAction;
  name?: string;
  className?: string;
}

const OPERATOR_KEYS: Record<Operator, { label: string; name: string }> = {
  '+': { label: '+', name: 'plus' },
  '-': { label: '−', name: 'minus' },
  '*': { label: '×', name: 'multiply' },
  '/': { label: '÷', name: 'divide' },
};

const digit = (d: string): Key => ({ label: d, action: { type: 'DIGIT', digit: d } });
const operator = (op: Operator): Key => ({
  ...OPERATOR_KEYS[op],
  action: { type: 'OPERATOR', operator: op },
  className: 'key--operator',
});

export const KEYS: Key[] = [
  { label: 'C', name: 'clear', action: { type: 'CLEAR' }, className: 'key--control' },
  { label: '⌫', name: 'backspace', action: { type: 'BACKSPACE' }, className: 'key--control' },
  { label: '(', name: 'open parenthesis', action: { type: 'PAREN', paren: '(' }, className: 'key--control' },
  { label: ')', name: 'close parenthesis', action: { type: 'PAREN', paren: ')' }, className: 'key--control' },
  digit('7'), digit('8'), digit('9'), operator('/'),
  digit('4'), digit('5'), digit('6'), operator('*'),
  digit('1'), digit('2'), digit('3'), operator('-'),
  digit('0'),
  { label: '.', name: 'decimal point', action: { type: 'DOT' } },
  { label: '=', name: 'equals', action: { type: 'EQUALS' }, className: 'key--equals' },
  operator('+'),
];

interface KeypadProps {
  onAction: (action: CalculatorAction) => void;
}

export function Keypad({ onAction }: KeypadProps) {
  return (
    <div className="keypad" role="group" aria-label="Keypad">
      {KEYS.map((key) => (
        <button
          key={key.label}
          type="button"
          className={`key ${key.className ?? ''}`.trim()}
          aria-label={key.name}
          onClick={() => onAction(key.action)}
        >
          {key.label}
        </button>
      ))}
    </div>
  );
}
