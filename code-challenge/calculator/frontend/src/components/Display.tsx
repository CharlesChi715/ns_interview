import type { CalculatorError, Status } from '../state/calculatorReducer';

interface DisplayProps {
  expression: string;
  status: Status;
  result: string | null;
  error: CalculatorError | null;
}

export function Display({ expression, status, result, error }: DisplayProps) {
  const position = status === 'error' ? (error?.position ?? null) : null;
  const marked = position !== null && position >= 0 && position < expression.length;

  return (
    <section className="display" aria-label="Calculator display">
      <div className="display__expression" data-testid="expression">
        {expression === '' ? (
          '0'
        ) : marked ? (
          <>
            {expression.slice(0, position)}
            <mark className="display__mark">{expression[position]}</mark>
            {expression.slice(position + 1)}
          </>
        ) : (
          expression
        )}
      </div>
      <output className="display__result" role="status" aria-live="polite" data-testid="result">
        {status === 'calculating' ? 'Calculating…' : status === 'result' ? result : ''}
      </output>
      <p className="display__error" role="alert" data-testid="error">
        {status === 'error' && error ? error.message : ''}
      </p>
    </section>
  );
}
