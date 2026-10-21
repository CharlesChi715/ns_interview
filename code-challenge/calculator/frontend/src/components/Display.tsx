import type { CalculatorError, Status } from '../state/calculatorReducer';

interface DisplayProps {
  expression: string;
  status: Status;
  result: string | null;
  error: CalculatorError | null;
}

const PRETTY: Record<string, string> = { '*': '×', '/': '÷', '-': '−' };

export function prettify(text: string): string {
  return text.replace(/[*/-]/g, (char) => PRETTY[char]);
}

export function Display({ expression, status, result, error }: DisplayProps) {
  const showingResult = status === 'result' && result !== null;
  const position = status === 'error' ? (error?.position ?? null) : null;
  const marked = position !== null && position >= 0 && position < expression.length;

  const entry =
    expression === '' ? (
      '0'
    ) : marked ? (
      <>
        {prettify(expression.slice(0, position))}
        <mark className="display__mark">{prettify(expression[position])}</mark>
        {prettify(expression.slice(position + 1))}
      </>
    ) : (
      prettify(expression)
    );

  return (
    <section className="display" aria-label="Calculator display">
      <div className="display__top">
        <div className="display__history" data-testid="history">
          {showingResult ? prettify(expression) : status === 'calculating' ? 'Calculating…' : ''}
        </div>
        <p className="display__error" role="alert" data-testid="error">
          {status === 'error' && error ? error.message : ''}
        </p>
      </div>
      <div className="display__main">
        <div className="display__expression" data-testid="expression">
          {showingResult ? '' : entry}
        </div>
        <output className="display__result" role="status" aria-live="polite" data-testid="result">
          {showingResult ? prettify(result) : ''}
        </output>
      </div>
    </section>
  );
}
