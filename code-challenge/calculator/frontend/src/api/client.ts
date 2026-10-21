export interface ApiError {
  code: string;
  message: string;
  position?: number | null;
}

export type CalculateResult =
  | { ok: true; result: string }
  | { ok: false; error: ApiError; retryable: boolean };

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const TIMEOUT_MS = 5000;

const UNEXPECTED: ApiError = {
  code: 'UNEXPECTED',
  message: 'The calculator service sent an unexpected reply. Please try again.',
};
const TIMEOUT: ApiError = {
  code: 'TIMEOUT',
  message: 'The calculator service took too long to answer. Please try again.',
};
const NETWORK: ApiError = {
  code: 'NETWORK',
  message: 'Calculator service unreachable. Check that the backend is running, then retry.',
};

export async function calculate(expression: string): Promise<CalculateResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE_URL}/api/v1/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression }),
      signal: controller.signal,
    });
    const body: unknown = await response.json().catch(() => null);
    if (response.ok && isSuccessBody(body)) {
      return { ok: true, result: body.result };
    }
    if (isErrorBody(body)) {
      return { ok: false, error: body.error, retryable: response.status >= 500 };
    }
    return { ok: false, error: UNEXPECTED, retryable: true };
  } catch (cause) {
    const aborted = (cause as { name?: string } | null)?.name === 'AbortError';
    return { ok: false, error: aborted ? TIMEOUT : NETWORK, retryable: true };
  } finally {
    clearTimeout(timer);
  }
}

function isSuccessBody(body: unknown): body is { result: string } {
  return isObject(body) && typeof body.result === 'string';
}

function isErrorBody(body: unknown): body is { error: ApiError } {
  if (!isObject(body) || !isObject(body.error)) return false;
  return typeof body.error.code === 'string' && typeof body.error.message === 'string';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
